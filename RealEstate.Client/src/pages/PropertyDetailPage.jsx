import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/home.css";
import "./styles/property-detail.css";
import Navigation from "@/components/Navigation.jsx";
import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {fetchProperty} from "@/services/propertyService.js";

const IMAGE_TYPES = {
    EXTERIOR: 0, PANORAMA_360: 1, FLOOR_PLAN: 2, HERO: 3, INTERIOR: 4,
};

function optimizeCloudinaryUrl(url, width = 1200) {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

function getOrientationLabel(orientation) {
    const orientations = ["North", "South", "East", "West"];
    return orientations[orientation] || orientation;
}

function ListingCard({listing, onPinClick}) {
    const floorPlanImage = listing.images?.find(img => img.type === IMAGE_TYPES.FLOOR_PLAN);
    const orientationIcons = {
        North: "bi-arrow-up",
        South: "bi-arrow-down",
        East: "bi-arrow-right",
        West: "bi-arrow-left"
    };
    const orientationLabel = getOrientationLabel(listing.orientation);
    const pins = listing.floorPlanPins || [];

    return (
        <div className={`listing-card ${!listing.available ? 'listing-unavailable' : ''}`}>
            <div className="listing-card-floorplan">
                {floorPlanImage ? (
                    <div className="floorplan-image-wrapper">
                        <img
                            src={optimizeCloudinaryUrl(floorPlanImage.url)}
                            alt="Floor Plan"
                        />
                        {listing.available && pins.map((pin) => (
                            <button
                                key={pin.id}
                                className="floorplan-pin"
                                style={{
                                    left: `${pin.x * 100}%`,
                                    top: `${pin.y * 100}%`,
                                }}
                                onClick={() => onPinClick?.(pin)}
                                title="View image"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="floorplan-placeholder">
                        <i className="bi bi-grid-1x2"></i>
                        <span>Floor plan</span>
                    </div>
                )}
                {!listing.available && (
                    <div className="listing-sold-overlay">
                        <span>Sold</span>
                    </div>
                )}
            </div>

            <div className="listing-card-info">
                <div className="listing-card-header">
                    <div className="listing-floor-info">
                        <span className="floor-label">Floor</span>
                        <span className="floor-number">{listing.floor}</span>
                    </div>
                </div>

                <div className="listing-price-block ">
                    <div className="listing-total-price">
                        <span className="price-currency">EUR</span>
                        <span className="price-value">{listing.pricePerSquareMeter.toLocaleString()} /m²</span>
                    </div>
                </div>

                <div className="listing-specs-grid">
                    <div className="spec-item spec-area">
                        <i className="bi bi-aspect-ratio"></i>
                        <div className="spec-content">
                            <span className="spec-value">{listing.squareMeters}</span>
                            <span className="spec-unit">m²</span>
                        </div>
                    </div>

                    <div className="spec-item spec-rooms">
                        <i className="bi bi-door-open"></i>
                        <div className="spec-content">
                            <span className="spec-value">{listing.roomCount}</span>
                            <span className="spec-unit">{listing.roomCount === 1 ? 'Room' : 'Rooms'}</span>
                        </div>
                    </div>

                    <div className="spec-item spec-baths">
                        <i className="bi bi-droplet"></i>
                        <div className="spec-content">
                            <span className="spec-value">{listing.bathroomCount}</span>
                            <span className="spec-unit">{listing.bathroomCount === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                    </div>

                    <div className="spec-item spec-orientation">
                        <i className={`bi ${orientationIcons[orientationLabel] || 'bi-compass'}`}></i>
                        <div className="spec-content">
                            <span className="spec-value">{orientationLabel}</span>
                            <span className="spec-unit">Facing</span>
                        </div>
                    </div>
                </div>

                {listing.hasBalcony && (
                    <div className="listing-amenities">
                        <div className="amenity-tag">
                            <i className="bi bi-flower1"></i>
                            <span>Balcony</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertyDetailPage() {
    const {id} = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        floor: "", minRooms: "", maxPrice: "", minSize: "", maxSize: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPin, setSelectedPin] = useState(null);

    useEffect(() => {
        if (!id) return;

        fetchProperty(id)
            .then(data => {
                setProperty(data);
                if (data.images?.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            })
            .catch(err => console.error("Failed to load property:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleFilterChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFilters(prev => ({
            ...prev, [name]: type === "checkbox" ? checked : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            floor: "", minRooms: "", maxPrice: "", minSize: "", maxSize: "", orientation: "",
        });
    };

    const applyFilters = (listings) => {
        return listings.filter(listing => {
            const totalPrice = listing.squareMeters * listing.pricePerSquareMeter;

            if (filters.floor && listing.floor !== parseInt(filters.floor)) return false;
            if (filters.minRooms && listing.roomCount < parseInt(filters.minRooms)) return false;
            if (filters.maxPrice && totalPrice > parseInt(filters.maxPrice)) return false;
            if (filters.minSize && listing.squareMeters < parseInt(filters.minSize)) return false;
            if (filters.maxSize && listing.squareMeters > parseInt(filters.maxSize)) return false;
            if (filters.orientation && listing.orientation !== parseInt(filters.orientation)) return false;
            return true;
        });
    };

    if (loading) {
        return (<div className="page-wrapper">
            <Navigation/>
            <div className="loading">Loading property...</div>
        </div>);
    }

    if (!property) {
        return (<div className="page-wrapper">
            <Navigation/>
            <div className="not-found">
                <h2>Property not found</h2>
                <Link to="/properties" className="back-link">
                    Back to properties
                </Link>
            </div>
        </div>);
    }

    const availableListings = property.listings?.filter(l => l.available) || [];
    const isVideo = selectedImage?.mimeType?.startsWith("video/");

    return (<div className="page-wrapper">
        <Navigation/>

        <div className="property-detail-container">
            <div className="d-flex align-items-center mb-0 position-relative py-3">
                <Link to="/properties" className="back-link mb-0">
                    BACK
                </Link>
            </div>

            <div className="property-main-row">
                <div className="property-hero">
                    <div className="property-hero-media">
                        {selectedImage && (isVideo ? (<video
                            controls
                            src={selectedImage.url}
                            className="hero-media"
                        />) : (<img
                            src={optimizeCloudinaryUrl(selectedImage.url)}
                            alt={property.name}
                            className="hero-media"
                        />))}
                    </div>

                    {property.images?.length > 1 && (<div className="property-thumbnails">
                            {property.images.map((image) => {
                                const thumbIsVideo = image.mimeType?.startsWith("video/");
                                return (<button
                                    key={image.id}
                                    className={`thumbnail-btn ${selectedImage?.id === image.id ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    {thumbIsVideo ? (<video src={image.url} muted/>) : (<img
                                        src={optimizeCloudinaryUrl(image.url, 150)}
                                        alt="Property thumbnail"
                                    />)}
                                </button>);
                            })}
                        </div>
                    )}

                    <div className="property-stats">
                        <div className="stat-item">
                            <span className="stat-value">{property.year}</span>
                            <span className="stat-label">Year Built</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{property.squareMeters}</span>
                            <span className="stat-label">Total m²</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{property.floorCount}</span>
                            <span className="stat-label">Floors</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{property.parkingSpaceCount}</span>
                            <span className="stat-label">Parking</span>
                        </div>
                        {property.hasElevator && (<div className="stat-item">
                            <i className="stat-value">Yes</i>
                            <span className="stat-label">Elevator</span>
                        </div>)}
                    </div>
                </div>

                <div className="property-info-section">
                    {property.description && (<div className="property-description">
                            <div>
                                <h1 className="description-title m-0">{property.name}</h1>
                                <div className="property-header d-flex align-items-center text-black mb-lg-5">
                                    <i className="bi bi-geo-alt text-secondary fs-5 me-1"></i>
                                    <i className="property-location m-0 p-0 fw-lighter">
                                        {property.street}, {property.city}, {property.country}
                                    </i>
                                </div>
                            </div>
                            <p className="description-text">{property.description}</p>
                        </div>
                    )}


                </div>
            </div>

            <div className="listings-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="section-title fw-light d-flex gap-3 align-items-center m-0">
                        Units
                        <span className="listing-count fw-lighter fs-6">
                                {availableListings.length} available
                        </span>
                    </h2>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className={`collapse ${showFilters ? 'show' : ''} mb-4`}>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-6 col-md-4 col-lg-2">
                                <label className="form-label small text-muted">Floor</label>
                                <select
                                    className="form-select form-select-sm"
                                    name="floor"
                                    value={filters.floor}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Floors</option>
                                    {[...new Set(property.listings?.map(l => l.floor))].sort((a, b) => a - b).map(floor => (
                                        <option key={floor} value={floor}>Floor {floor}</option>))}
                                </select>
                            </div>

                            <div className="col-6 col-md-4 col-lg-2">
                                <label className="form-label small text-muted">Min Rooms</label>
                                <select
                                    className="form-select form-select-sm"
                                    name="minRooms"
                                    value={filters.minRooms}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any</option>
                                    {[1, 2, 3, 4, 5].map(n => (<option key={n} value={n}>{n}+</option>))}
                                </select>
                            </div>

                            <div className="col-6 col-md-4 col-lg-2">
                                <label className="form-label small text-muted">Max Price (EUR)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="No limit"
                                />
                            </div>

                            <div className="col-6 col-md-4 col-lg-2">
                                <label className="form-label small text-muted">Size (m²)</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="minSize"
                                        value={filters.minSize}
                                        onChange={handleFilterChange}
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="maxSize"
                                        value={filters.maxSize}
                                        onChange={handleFilterChange}
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            <div className="col-6 col-md-4 col-lg-2">
                                <label className="form-label small text-muted">Orientation</label>
                                <select
                                    className="form-select form-select-sm"
                                    name="orientation"
                                    value={filters.orientation}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any</option>
                                    <option value="0">North</option>
                                    <option value="1">South</option>
                                    <option value="2">East</option>
                                    <option value="3">West</option>
                                </select>
                            </div>

                            <div className="col-6 col-md-4 col-lg-2 d-flex align-items-end">
                                <button
                                    className="btn btn-outline-secondary btn-sm w-100"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {property.listings?.length > 0 ? (<>
                    {applyFilters(property.listings).length > 0 ? (<div className="listings-grid">
                        {applyFilters(property.listings).map(listing => (
                            <ListingCard key={listing.id} listing={listing} onPinClick={setSelectedPin}/>))}
                    </div>) : (<p className="no-listings">No units match your filters.</p>)}
                </>) : (<p className="no-listings">No units available.</p>)}
            </div>
        </div>

        {/* Pin Image Modal */}
        {selectedPin && (
            <div className="pin-modal-overlay" onClick={() => setSelectedPin(null)}>
                <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="pin-modal-close" onClick={() => setSelectedPin(null)}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                    {selectedPin.image?.url ? (
                        <img src={selectedPin.image.url} alt="Pin detail" />
                    ) : (
                        <p className="pin-modal-empty">No image available</p>
                    )}
                </div>
            </div>
        )}
    </div>);
}