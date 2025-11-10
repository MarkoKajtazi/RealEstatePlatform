import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createListings,
    deleteListingFloorPlan,
    fetchListing, insertFloorPlan,
    updateListing,
} from "../../services/listingService.js";
import {fetchProperty, insertPropertyImage} from "../../services/propertyService.js";

export default function ListingForm() {
    const { id, propertyId } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const initialForm = {
        floor: 0,
        squareMeters: 0,
        pricePerSquareMeter: 0.0,
        orientation: 0,
        roomCount: 0,
        bathroomCount: 0,
        hasBalcony: false,
        available: true,
    };

    const [form, setForm] = useState(initialForm);
    const [property, setProperty] = useState();
    const [existingImages, setExistingImages] = useState([]);
    const [newFloorPlan, setNewFloorPlan] = useState(null);
    const fileInputRef = useRef();

    const [listingPropertyId, setListingPropertyId] = useState(propertyId ?? "");

    // Load listing or property
    useEffect(() => {
        let mounted = true;

        async function loadListing() {
            try {
                if (!id) return;
                setLoading(true);
                const data = await fetchListing(id);
                if (!mounted) return;

                setForm({
                    floor: data.floor ?? 0,
                    squareMeters: data.squareMeters ?? 0,
                    pricePerSquareMeter: data.pricePerSquareMeter ?? 0.0,
                    orientation: data.orientation ?? 0,
                    roomCount: data.roomCount ?? 0,
                    bathroomCount: data.bathroomCount ?? 0,
                    hasBalcony: !!data.hasBalcony,
                    available: !!data.available,
                });

                setExistingImages(data.images ?? []);
                setListingPropertyId(data.propertyId ?? (propertyId ?? ""));
            } catch (err) {
                console.error("Failed to load listing", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        async function loadPropertyForCreate() {
            try {
                if (!propertyId) return;
                setLoading(true);
                const data = await fetchProperty(propertyId);
                if (!mounted) return;

                setProperty({
                    id: data.id,
                    name: data.name ?? "",
                    squareMeters: data.squareMeters ?? 0,
                    floorCount: data.floorCount ?? 0,
                    parkingSpaceCount: data.parkingSpaceCount ?? 0,
                    propertyType: data.propertyType ?? 0,
                    hasElevator: !!data.hasElevator,
                    city: data.city ?? "",
                    country: data.country ?? "",
                    street: data.street ?? "",
                });

                setListingPropertyId(propertyId ?? "");
            } catch (err) {
                console.error("Failed to load property", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (isEdit) loadListing();
        else loadPropertyForCreate();

        return () => {
            mounted = false;
        };
    }, [id, propertyId, isEdit]);

    useEffect(() => {
        return () => {
            if (newFloorPlan?.preview) URL.revokeObjectURL(newFloorPlan.preview);
        };
    }, [newFloorPlan]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? Number(value)
                        : value,
        }));
    }

    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const upload = {
            id: `${Date.now()}`,
            file,
            preview: URL.createObjectURL(file),
        };

        setNewFloorPlan(upload);
        if (fileInputRef.current) fileInputRef.current.value = null;
    }

    function removeNewFile() {
        if (newFloorPlan?.preview) URL.revokeObjectURL(newFloorPlan.preview);
        setNewFloorPlan(null);
    }

    async function handleRemoveExistingImage(imageId) {
        const previous = existingImages;
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

        try {
            await deleteListingFloorPlan(id, imageId);
        } catch (err) {
            console.error("Failed to delete image", err);
            setExistingImages(previous);
            alert("Failed to delete image. Try again.");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        try {
            const finalPropertyId = listingPropertyId ?? propertyId ?? "";

            if (!finalPropertyId.trim()) {
                alert(
                    "Missing propertyId (expected a non-empty string). Cannot save listing."
                );
                setSaving(false);
                return;
            }

            const payload = {
                propertyId: finalPropertyId,
                orientation: Number(form.orientation) || 0,
                floor: Number(form.floor) || 0,
                squareMeters: Number(form.squareMeters) || 0,
                roomCount: Number(form.roomCount) || 0,
                bathroomCount: Number(form.bathroomCount) || 0,
                hasBalcony: !!form.hasBalcony,
                pricePerSquareMeter: Number(form.pricePerSquareMeter) || 0.0,
                available: !!form.available,
            };

            var newListingId;
            if (isEdit) {
                payload.id = id;
                await updateListing(id, payload);
                newListingId = id;
            } else {
                let newListing = await createListings(payload);
                if (newListing) newListingId = newListing.id;
            }

            if(newFloorPlan && newListingId) {
                const formData = new FormData();
                formData.append("File", newFloorPlan.file);
                formData.append("Type", "2");
                formData.append("ListingId", newListingId);

                await insertFloorPlan(newListingId, formData);
            }

            navigate(`/admin/properties/${finalPropertyId}`, { replace: true });
        } catch (err) {
            console.error("Failed to save listing", err);
            alert("Failed to save listing. Check console for details.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-dark text-white rounded-2 p-3" style={{ height: "100%", minHeight: 0 }}>
            <h2 className="mb-3">
                {isEdit ? "Edit Listing" : `Create Listing for ${property?.name ?? "—"}`}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Orientation</label>
                        <select
                            name="orientation"
                            value={form.orientation}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value={0}>North</option>
                            <option value={1}>South</option>
                            <option value={2}>East</option>
                            <option value={3}>West</option>
                        </select>
                    </div>

                    <div className="col mb-3">
                        <label className="form-label">Floor</label>
                        <input
                            name="floor"
                            value={form.floor}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col mb-3">
                        <label className="form-label">Square Meters</label>
                        <input
                            name="squareMeters"
                            type="number"
                            min={0}
                            value={form.squareMeters}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-3 col-sm-1 mb-3">
                        <label className="form-label">Rooms</label>
                        <input
                            name="roomCount"
                            type="number"
                            min={0}
                            value={form.roomCount}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-3 col-sm-1 mb-3">
                        <label className="form-label">Bathrooms</label>
                        <input
                            name="bathroomCount"
                            type="number"
                            min={0}
                            value={form.bathroomCount}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="hasBalcony"
                        id="hasBalcony"
                        checked={form.hasBalcony}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="hasBalcony">
                        Balcony
                    </label>
                </div>

                <div className="mb-3">
                    <label className="form-label">Price (per m²)</label>
                    <input
                        name="pricePerSquareMeter"
                        type="number"
                        min={0}
                        value={form.pricePerSquareMeter}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="available"
                        id="available"
                        checked={form.available}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="available">
                        Available
                    </label>
                </div>

                {(existingImages.length > 0 || newFloorPlan) && (
                    <div className="mb-3">
                        <label className="form-label">Floor Plan</label>
                        <div className="d-flex gap-2 flex-row flex-nowrap overflow-auto p-2">
                            {existingImages.map((img) => (
                                <div key={img.id} className="position-relative">
                                    <img src={img.url} alt="Floor plan" style={{ display: "block" }} />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute"
                                        style={{ top: 6, right: 6 }}
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {newFloorPlan && (
                                <div>
                                    <img
                                        src={newFloorPlan.preview}
                                        alt="preview"
                                        style={{ width: 150, display: "block" }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary position-absolute"
                                        style={{ top: 6, right: 6 }}
                                        onClick={removeNewFile}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {existingImages.length === 0 && !newFloorPlan && (
                    <div className="mb-3">
                        <label className="form-label">Add Floor Plan</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleFile}
                        />
                    </div>
                )}

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving
                            ? isEdit
                                ? "Saving..."
                                : "Creating..."
                            : isEdit
                                ? "Save changes"
                                : "Create listing"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
