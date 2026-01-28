import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import {
    createListings,
    deleteListingFloorPlan,
    fetchListing,
    insertFloorPlan,
    updateListing,
    fetchFloorPlanPins,
    createFloorPlanPin,
    deleteFloorPlanPin,
} from "../../services/listingService.js";
import { fetchProperty } from "../../services/propertyService.js";

const IMAGE_TYPES = [
    { value: 0, label: "Exterior" },
    { value: 1, label: "Panorama 360" },
    { value: 2, label: "Floor Plan" },
    { value: 3, label: "Hero" },
    { value: 4, label: "Interior" },
];

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

    // Floor plan pin state
    const [floorPlanPins, setFloorPlanPins] = useState([]);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pendingPinCoords, setPendingPinCoords] = useState({ x: 0, y: 0 });
    const [pinImage, setPinImage] = useState(null);
    const [savingPin, setSavingPin] = useState(false);
    const [selectedPin, setSelectedPin] = useState(null); // For viewing existing pin images
    const [deletingPin, setDeletingPin] = useState(false);
    const floorPlanRef = useRef(null);
    const pinFileInputRef = useRef(null);

    // New image upload state
    const [newImage, setNewImage] = useState(null);
    const [selectedImageType, setSelectedImageType] = useState(0);
    const [uploadingImage, setUploadingImage] = useState(false);
    const newImageInputRef = useRef(null);

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

    // Load floor plan pins when editing
    useEffect(() => {
        if (!isEdit || !id) return;

        async function loadPins() {
            try {
                const pins = await fetchFloorPlanPins(id);
                setFloorPlanPins(pins ?? []);
            } catch (err) {
                console.error("Failed to load floor plan pins", err);
            }
        }

        loadPins();
    }, [isEdit, id]);

    // Cleanup pin image preview
    useEffect(() => {
        return () => {
            if (pinImage?.preview) URL.revokeObjectURL(pinImage.preview);
        };
    }, [pinImage]);

    // Cleanup new image preview
    useEffect(() => {
        return () => {
            if (newImage?.preview) URL.revokeObjectURL(newImage.preview);
        };
    }, [newImage]);

    // Helper function to group images by type
    function groupImagesByType(images) {
        return IMAGE_TYPES.map((type) => ({
            ...type,
            images: images.filter((img) => img.type === type.value),
        })).filter((group) => group.images.length > 0);
    }

    function handleFloorPlanClick(e) {
        if (!isEdit) return; // Only allow adding pins when editing

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Clamp values between 0 and 1
        const clampedX = Math.max(0, Math.min(1, x));
        const clampedY = Math.max(0, Math.min(1, y));

        setPendingPinCoords({ x: clampedX, y: clampedY });
        setShowPinModal(true);
    }

    function handlePinImageChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setPinImage({
            file,
            preview: URL.createObjectURL(file),
        });
        if (pinFileInputRef.current) pinFileInputRef.current.value = null;
    }

    function handleClosePinModal() {
        setShowPinModal(false);
        setPendingPinCoords({ x: 0, y: 0 });
        if (pinImage?.preview) URL.revokeObjectURL(pinImage.preview);
        setPinImage(null);
    }

    async function handleSavePin() {
        if (!pinImage?.file) {
            alert("Please select an image for the pin.");
            return;
        }

        setSavingPin(true);
        try {
            const formData = new FormData();
            // FloorPlanPin properties
            formData.append("X", pendingPinCoords.x.toString());
            formData.append("Y", pendingPinCoords.y.toString());
            // UploadImageDTO properties
            formData.append("File", pinImage.file);
            formData.append("Type", "3"); // Hero image type for pins

            await createFloorPlanPin(id, formData);

            // Reload pins
            const pins = await fetchFloorPlanPins(id);
            setFloorPlanPins(pins ?? []);

            handleClosePinModal();
        } catch (err) {
            console.error("Failed to create floor plan pin", err);
            alert("Failed to create pin. Check console for details.");
        } finally {
            setSavingPin(false);
        }
    }

    async function handleDeletePin() {
        if (!selectedPin?.id) return;

        if (!window.confirm("Are you sure you want to delete this pin?")) {
            return;
        }

        setDeletingPin(true);
        try {
            await deleteFloorPlanPin(id, selectedPin.id);

            // Reload pins
            const pins = await fetchFloorPlanPins(id);
            setFloorPlanPins(pins ?? []);

            setSelectedPin(null);
        } catch (err) {
            console.error("Failed to delete floor plan pin", err);
            alert("Failed to delete pin. Check console for details.");
        } finally {
            setDeletingPin(false);
        }
    }

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

    // New image upload handlers
    function handleNewImageFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setNewImage({
            file,
            preview: URL.createObjectURL(file),
        });
        if (newImageInputRef.current) newImageInputRef.current.value = null;
    }

    function handleNewImageTypeChange(e) {
        setSelectedImageType(Number(e.target.value));
    }

    function removeNewImage() {
        if (newImage?.preview) URL.revokeObjectURL(newImage.preview);
        setNewImage(null);
    }

    async function handleUploadNewImage() {
        if (!newImage?.file || !id) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("File", newImage.file);
            formData.append("Type", selectedImageType.toString());

            await insertFloorPlan(id, formData);

            // Reload listing to get updated images
            const data = await fetchListing(id);
            setExistingImages(data.images ?? []);

            // Clear the new image state
            removeNewImage();
        } catch (err) {
            console.error("Failed to upload image", err);
            alert("Failed to upload image. Check console for details.");
        } finally {
            setUploadingImage(false);
        }
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
        <div className="bg-dark text-white rounded-2 p-3 overflow-auto" style={{ height: "100%", minHeight: 0 }}>
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

                {/* Images Section */}
                {(existingImages.length > 0 || newFloorPlan) && (
                    <div className="mb-3">
                        <label className="form-label">Images</label>

                        {/* Grouped images by type */}
                        {groupImagesByType(existingImages).map((group) => (
                            <div key={group.value} className="mb-3">
                                <div className="text-muted mb-2" style={{ fontSize: "0.9em", borderBottom: "1px solid #444", paddingBottom: 4 }}>
                                    {group.label}
                                    {group.value === 2 && isEdit && (
                                        <span className="ms-2" style={{ fontSize: "0.85em" }}>
                                            (Click on floor plan to add a pin)
                                        </span>
                                    )}
                                </div>
                                <div className="d-flex gap-2 flex-row flex-wrap p-2">
                                    {group.images.map((img) => (
                                        <div key={img.id} className="position-relative">
                                            {/* Floor plan images get special treatment with pins */}
                                            {group.value === 2 ? (
                                                <div
                                                    ref={floorPlanRef}
                                                    style={{
                                                        position: "relative",
                                                        display: "inline-block",
                                                        cursor: isEdit ? "crosshair" : "default",
                                                    }}
                                                    onClick={handleFloorPlanClick}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt="Floor plan"
                                                        style={{ display: "block", maxHeight: 300 }}
                                                        draggable={false}
                                                    />
                                                    {/* Render existing pins */}
                                                    {floorPlanPins.map((pin) => (
                                                        <div
                                                            key={pin.id}
                                                            style={{
                                                                position: "absolute",
                                                                left: `${pin.x * 100}%`,
                                                                top: `${pin.y * 100}%`,
                                                                transform: "translate(-50%, -50%)",
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: "50%",
                                                                backgroundColor: "#dc3545",
                                                                border: "3px solid white",
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                                                cursor: "pointer",
                                                                zIndex: 10,
                                                            }}
                                                            title="Click to view image"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPin(pin);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <img
                                                    src={img.url}
                                                    alt={group.label}
                                                    style={{ height: 150, display: "block", objectFit: "cover" }}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute"
                                                style={{ top: 6, right: 6, zIndex: 20 }}
                                                onClick={() => handleRemoveExistingImage(img.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* New floor plan preview (for create mode) */}
                        {newFloorPlan && (
                            <div className="mb-3">
                                <div className="text-muted mb-2" style={{ fontSize: "0.9em", borderBottom: "1px solid #444", paddingBottom: 4 }}>
                                    Floor Plan (pending upload)
                                </div>
                                <div className="d-flex gap-2 p-2">
                                    <div className="position-relative">
                                        <img
                                            src={newFloorPlan.preview}
                                            alt="preview"
                                            style={{ height: 150, display: "block" }}
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
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Floor Plan for create mode */}
                {!isEdit && existingImages.length === 0 && !newFloorPlan && (
                    <div className="mb-3">
                        <label className="form-label">Add Floor Plan</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="form-control"
                            accept="image/*,video/*"
                            onChange={handleFile}
                        />
                    </div>
                )}

                {/* Add New Image Section (edit mode only) */}
                {isEdit && (
                    <div className="mb-4 p-3 border border-secondary rounded">
                        <label className="form-label">Add New Image</label>
                        <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label small text-muted">Image Type</label>
                                <Form.Select
                                    value={selectedImageType}
                                    onChange={handleNewImageTypeChange}
                                    disabled={uploadingImage}
                                >
                                    {IMAGE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small text-muted">Select Image</label>
                                <Form.Control
                                    ref={newImageInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleNewImageFile}
                                    disabled={uploadingImage}
                                />
                            </div>
                            <div className="col-md-3">
                                <Button
                                    variant="success"
                                    onClick={handleUploadNewImage}
                                    disabled={!newImage || uploadingImage}
                                    className="w-100"
                                >
                                    {uploadingImage ? "Uploading..." : "Upload"}
                                </Button>
                            </div>
                        </div>
                        {newImage?.preview && (
                            <div className="mt-3 position-relative d-inline-block">
                                <img
                                    src={newImage.preview}
                                    alt="Preview"
                                    style={{ maxHeight: 150 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary position-absolute"
                                    style={{ top: 4, right: 4 }}
                                    onClick={removeNewImage}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
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

            {/* Pin Creation Modal */}
            <Modal show={showPinModal} onHide={handleClosePinModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Floor Plan Pin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Position:</strong>{" "}
                        X: {(pendingPinCoords.x * 100).toFixed(1)}%,{" "}
                        Y: {(pendingPinCoords.y * 100).toFixed(1)}%
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Pin Image</Form.Label>
                        <Form.Control
                            ref={pinFileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handlePinImageChange}
                        />
                        <Form.Text className="text-muted">
                            Upload an image to associate with this pin location.
                        </Form.Text>
                    </Form.Group>

                    {pinImage?.preview && (
                        <div className="mb-3">
                            <img
                                src={pinImage.preview}
                                alt="Pin preview"
                                style={{ maxWidth: "100%", maxHeight: 200 }}
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePinModal} disabled={savingPin}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSavePin} disabled={savingPin || !pinImage}>
                        {savingPin ? "Saving..." : "Add Pin"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Pin Image Modal */}
            <Modal show={!!selectedPin} onHide={() => setSelectedPin(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Pin Image</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedPin?.image?.url ? (
                        <img
                            src={selectedPin.image.url}
                            alt="Pin"
                            style={{ maxWidth: "100%", maxHeight: "70vh" }}
                        />
                    ) : (
                        <p className="text-muted">No image available for this pin.</p>
                    )}
                    <div className="mt-3 text-muted">
                        Position: X: {((selectedPin?.x ?? 0) * 100).toFixed(1)}%, Y: {((selectedPin?.y ?? 0) * 100).toFixed(1)}%
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={handleDeletePin}
                        disabled={deletingPin}
                    >
                        {deletingPin ? "Deleting..." : "Delete Pin"}
                    </Button>
                    <Button variant="secondary" onClick={() => setSelectedPin(null)} disabled={deletingPin}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
