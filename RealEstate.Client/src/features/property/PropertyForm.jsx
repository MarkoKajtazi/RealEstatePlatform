import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchProperty,
    createProperty,
    updateProperty,
    insertPropertyImage,
    deleteImage,
} from "../../services/propertyService.js";

export default function PropertyForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const initialForm = {
        name: "",
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
    const [existingFloorPlan, setExistingFloorPlan] = useState(null); // only one
    const [newFloorPlan, setNewFloorPlan] = useState(null);
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
                    squareMeters: data.squareMeters ?? 0,
                    floorCount: data.floorCount ?? 0,
                    parkingSpaceCount: data.parkingSpaceCount ?? 0,
                    propertyType: data.propertyType ?? 0,
                    hasElevator: !!data.hasElevator,
                    city: data.city ?? "",
                    country: data.country ?? "",
                    street: data.street ?? "",
                });

                // Assuming the backend marks floor plan as type 0
                const floorPlan = (data.images ?? []).find((img) => img.type === 0);
                setExistingFloorPlan(floorPlan || null);
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
            if (newFloorPlan?.preview) URL.revokeObjectURL(newFloorPlan.preview);
        };
    }, [newFloorPlan]);

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
        };

        setNewFloorPlan(upload);
        if (fileInputRef.current) fileInputRef.current.value = null;
    }

    // Remove new floor plan before submission
    function removeNewFile() {
        if (newFloorPlan?.preview) URL.revokeObjectURL(newFloorPlan.preview);
        setNewFloorPlan(null);
    }

    // Remove existing floor plan (from backend)
    async function handleRemoveExistingImage(imageId) {
        const prev = existingFloorPlan;
        setExistingFloorPlan(null);
        try {
            await deleteImage(id, imageId);
        } catch (err) {
            console.error("Failed to delete image", err);
            setExistingFloorPlan(prev);
            alert("Failed to delete image. Try again.");
        }
    }

    // Submit handler
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: form.name,
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

            // Upload floor plan image if added
            if (newFloorPlan && propertyId) {
                const formData = new FormData();
                formData.append("File", newFloorPlan.file);
                formData.append("Type", "0"); // floor plan type
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

                <div className="mb-3">
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

                {/* Floor Plan Section */}
                {(existingFloorPlan || newFloorPlan) && (
                    <div className="mb-3">
                        <label className="form-label">Floor Plan</label>
                        <div
                            className="d-flex gap-2 flex-row flex-nowrap overflow-auto p-2"
                            style={{ background: "#f7f7f7" }}
                        >
                            {existingFloorPlan && (
                                <div style={{ minWidth: 150 }} className="position-relative">
                                    <img
                                        src={existingFloorPlan.url}
                                        alt="Floor plan"
                                        style={{ width: 150, display: "block" }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute"
                                        style={{ top: 6, right: 6 }}
                                        onClick={() => handleRemoveExistingImage(existingFloorPlan.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {newFloorPlan && (
                                <div style={{ minWidth: 150, position: "relative" }}>
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

                {/* Upload Input - only show if no existing or new floor plan */}
                {!existingFloorPlan && !newFloorPlan && (
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
