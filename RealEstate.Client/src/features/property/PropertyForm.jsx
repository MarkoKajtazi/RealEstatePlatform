import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchProperty,
    createProperty,
    updateProperty,
    insertPropertyImage,
    deleteImage,
} from "../../services/propertyService.js";

const IMAGE_TYPES = [
    { value: 0, label: "Exterior" },
    { value: 1, label: "Panorama 360" },
    { value: 2, label: "Floor Plan" },
    { value: 3, label: "Hero" },
    { value: 4, label: "Interior" },
];

export default function PropertyForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const initialForm = {
        name: "",
        description: "",
        year: new Date().getFullYear(),
        squareMeters: 0,
        floorCount: 0,
        parkingSpaceCount: 0,
        propertyType: 0,
        hasElevator: false,
        city: "",
        country: "",
        street: "",
    };

    const [form, setForm] = useState(initialForm);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [selectedImageType, setSelectedImageType] = useState(0);
    const fileInputRef = useRef();

    // Load property if editing
    useEffect(() => {
        let mounted = true;
        if (!isEdit) return () => (mounted = false);

        async function load() {
            try {
                const data = await fetchProperty(id.toString());
                if (!mounted) return;

                setForm({
                    name: data.name ?? "",
                    description: data.description ?? "",
                    year: data.year ?? new Date().getFullYear(),
                    squareMeters: data.squareMeters ?? 0,
                    floorCount: data.floorCount ?? 0,
                    parkingSpaceCount: data.parkingSpaceCount ?? 0,
                    propertyType: data.propertyType ?? 0,
                    hasElevator: !!data.hasElevator,
                    city: data.city ?? "",
                    country: data.country ?? "",
                    street: data.street ?? "",
                });

                setExistingImages(data.images ?? []);
            } catch (err) {
                console.error("Failed to load property", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => (mounted = false);
    }, [id, isEdit]);

    // Clean up preview URLs
    useEffect(() => {
        return () => {
            newImages.forEach((img) => {
                if (img.preview) URL.revokeObjectURL(img.preview);
            });
        };
    }, [newImages]);

    // Handle input change
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

    // Handle file upload
    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const upload = {
            id: `${Date.now()}`,
            file,
            preview: URL.createObjectURL(file),
            type: selectedImageType,
        };

        setNewImages((prev) => [...prev, upload]);
        if (fileInputRef.current) fileInputRef.current.value = null;
    }

    // Remove new image before submission
    function removeNewImage(imageId) {
        setNewImages((prev) => {
            const img = prev.find((i) => i.id === imageId);
            if (img?.preview) URL.revokeObjectURL(img.preview);
            return prev.filter((i) => i.id !== imageId);
        });
    }

    // Remove existing image (from backend)
    async function handleRemoveExistingImage(imageId) {
        const prev = existingImages;
        setExistingImages((images) => images.filter((img) => img.id !== imageId));
        try {
            await deleteImage(id, imageId);
        } catch (err) {
            console.error("Failed to delete image", err);
            setExistingImages(prev);
            alert("Failed to delete image. Try again.");
        }
    }

    // Helper to get image type label
    function getImageTypeLabel(typeValue) {
        return IMAGE_TYPES.find((t) => t.value === typeValue)?.label ?? "Unknown";
    }

    // Submit handler
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: form.name,
                description: form.description,
                year: Number(form.year) || new Date().getFullYear(),
                squareMeters: Number(form.squareMeters) || 0,
                floorCount: Number(form.floorCount) || 0,
                parkingSpaceCount: Number(form.parkingSpaceCount) || 0,
                propertyType: Number(form.propertyType) || 0,
                hasElevator: !!form.hasElevator,
                city: form.city,
                country: form.country,
                street: form.street,
            };

            let propertyId = id;

            if (isEdit) {
                payload.id = id.toString();
                await updateProperty(id.toString(), payload);
            } else {
                const created = await createProperty(payload);
                propertyId = created?.id?.toString();
            }

            // Upload all new images
            for (const img of newImages) {
                const formData = new FormData();
                formData.append("File", img.file);
                formData.append("Type", img.type.toString());
                formData.append("PropertyId", propertyId);

                await insertPropertyImage(propertyId, formData);
            }

            navigate(isEdit ? `/admin/properties/${propertyId}` : "/admin/properties", {
                replace: true,
            });
        } catch (err) {
            console.error("Failed to save property", err);
            alert("Failed to save property. Check console for details.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Loading property...</div>;

    return (
        <div className="bg-dark text-white rounded-2 p-3" style={{ height: "100%", minHeight: 0 }}>
            <h2 className="mb-3">{isEdit ? "Edit Property" : "Create Property"}</h2>

            <form onSubmit={handleSubmit}>
                {/* Property Info */}
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="form-control"
                        rows={3}
                    />
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
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

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Floor Count</label>
                        <input
                            name="floorCount"
                            type="number"
                            min={0}
                            value={form.floorCount}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Parking Spaces</label>
                        <input
                            name="parkingSpaceCount"
                            type="number"
                            min={0}
                            value={form.parkingSpaceCount}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Property Type</label>
                        <select
                            name="propertyType"
                            value={form.propertyType}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value={0}>Building</option>
                            <option value={1}>House</option>
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Year Built</label>
                        <input
                            name="year"
                            type="number"
                            min={1800}
                            max={new Date().getFullYear()}
                            value={form.year}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="hasElevator"
                        id="hasElevator"
                        checked={form.hasElevator}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="hasElevator">
                        Elevator
                    </label>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Street</label>
                        <input
                            name="street"
                            value={form.street}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">City</label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Country</label>
                        <input
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>

                {/* Property Images Section */}
                {(existingImages.length > 0 || newImages.length > 0) && (
                    <div className="mb-3">
                        <label className="form-label">Property Images</label>
                        <div
                            className="d-flex gap-2 flex-row flex-wrap p-2 rounded"
                            style={{ background: "#2a2a2a" }}
                        >
                            {existingImages.map((img) => (
                                <div key={img.id} style={{ minWidth: 150 }} className="position-relative">
                                    <img
                                        src={img.url}
                                        alt={getImageTypeLabel(img.type)}
                                        style={{ width: 150, height: 100, objectFit: "cover", display: "block", borderRadius: 4 }}
                                    />
                                    <span
                                        className="badge bg-secondary position-absolute"
                                        style={{ bottom: 6, left: 6, fontSize: "0.7rem" }}
                                    >
                                        {getImageTypeLabel(img.type)}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute"
                                        style={{ top: 6, right: 6 }}
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            {newImages.map((img) => (
                                <div key={img.id} style={{ minWidth: 150, position: "relative" }}>
                                    <img
                                        src={img.preview}
                                        alt="preview"
                                        style={{ width: 150, height: 100, objectFit: "cover", display: "block", borderRadius: 4 }}
                                    />
                                    <span
                                        className="badge bg-info position-absolute"
                                        style={{ bottom: 6, left: 6, fontSize: "0.7rem" }}
                                    >
                                        {getImageTypeLabel(img.type)} (new)
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary position-absolute"
                                        style={{ top: 6, right: 6 }}
                                        onClick={() => removeNewImage(img.id)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Property Image */}
                <div className="mb-3">
                    <label className="form-label">Add Image</label>
                    <div className="row g-2">
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={selectedImageType}
                                onChange={(e) => setSelectedImageType(Number(e.target.value))}
                            >
                                {IMAGE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-8">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="form-control"
                                accept="image/*,video/*"
                                onChange={handleFile}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving
                            ? isEdit
                                ? "Saving..."
                                : "Creating..."
                            : isEdit
                                ? "Save changes"
                                : "Create property"}
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
