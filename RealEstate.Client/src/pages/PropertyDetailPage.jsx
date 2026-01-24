import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/home.css";
import "./styles/property-detail.css";
import Navigation from "@/components/Navigation.jsx";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProperty } from "@/services/propertyService.js";

const IMAGE_TYPES = {
    EXTERIOR: 0,
    PANORAMA_360: 1,
    FLOOR_PLAN: 2,
    HERO: 3,
    INTERIOR: 4,
};

function optimizeCloudinaryUrl(url, width = 1200) {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

function getOrientationLabel(orientation) {
    const orientations = ["North", "South", "East", "West"];
    return orientations[orientation] || orientation;
}

function ListingCard({ listing }) {
    const totalPrice = listing.squareMeters * listing.pricePerSquareMeter;
    const floorPlanImage = listing.images?.find(img => img.type === IMAGE_TYPES.FLOOR_PLAN);

    return (
        <div className={`listing-card ${!listing.available ? 'listing-unavailable' : ''}`}>
            {floorPlanImage && (
                <div className="listing-card-floorplan">
                    <img
                        src={optimizeCloudinaryUrl(floorPlanImage.url, 300)}
                        alt="Floor Plan"
                    />
                </div>
            )}
            <div className="listing-card-content">
                <div className="listing-card-header">
                    {/*<span className="listing-floor">Floor {listing.floor}</span>*/}
                    {!listing.available && <span className="listing-sold">Sold</span>}
                </div>

                <div className="listing-card-body">
                    <div className="listing-price">
                        {totalPrice.toLocaleString()} EUR
                    </div>
                    <div className="listing-price-sqm">
                        {listing.pricePerSquareMeter.toLocaleString()}/m² EUR
                    </div>

                    <div className="listing-specs">
                        <div className="listing-spec">
                            <span className="spec-value">{listing.squareMeters}</span>
                            <span className="spec-label">m²</span>
                        </div>
                        <div className="listing-spec">
                            <span className="spec-value">{listing.roomCount}</span>
                            <span className="spec-label">Rooms</span>
                        </div>
                        <div className="listing-spec">
                            <span className="spec-value">{listing.bathroomCount}</span>
                            <span className="spec-label">Baths</span>
                        </div>
                    </div>

                    <div className="listing-features">
                        <span className="listing-feature">
                            {getOrientationLabel(listing.orientation)} facing
                        </span>
                        {listing.hasBalcony && (
                            <span className="listing-feature">Balcony</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PropertyDetailPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        floor: "",
        minRooms: "",
        maxPrice: "",
        minSize: "",
        maxSize: "",
        orientation: "",
        hasBalcony: false,
        showSold: true,
    });

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
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            floor: "",
            minRooms: "",
            maxPrice: "",
            minSize: "",
            maxSize: "",
            orientation: "",
            hasBalcony: false,
            showSold: true,
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
            if (filters.hasBalcony && !listing.hasBalcony) return false;
            if (!filters.showSold && !listing.available) return false;

            return true;
        });
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navigation />
                <div className="loading">Loading property...</div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="page-wrapper">
                <Navigation />
                <div className="not-found">
                    <h2>Property not found</h2>
                    <Link to="/properties" className="back-link">
                        Back to properties
                    </Link>
                </div>
            </div>
        );
    }

    const propertyType = property.propertyType === 0 ? "Building" : "House";
    const availableListings = property.listings?.filter(l => l.available) || [];
    const isVideo = selectedImage?.mimeType?.startsWith("video/");

    return (
        <div className="page-wrapper">
            <Navigation />

            <div className="property-detail-container">
                <div className="d-flex align-items-center mb-3 position-relative py-3">
                    <Link to="/properties" className="back-link mb-0">
                        BACK
                    </Link>
                    <div className="d-flex align-items-center gap-2 position-absolute start-50 translate-middle-x">
                        <h1 className="property-title mb-0">{property.name}</h1>
                        <span className="property-type-badge mb-0">{propertyType}</span>
                    </div>
                </div>


                <div className="property-hero">
                    <div className="property-hero-media">
                        {selectedImage && (
                            isVideo ? (
                                <video
                                    controls
                                    src={selectedImage.url}
                                    className="hero-media"
                                />
                            ) : (
                                <img
                                    src={optimizeCloudinaryUrl(selectedImage.url)}
                                    alt={property.name}
                                    className="hero-media"
                                />
                            )
                        )}
                    </div>

                    {property.images?.length > 1 && (
                        <div className="property-thumbnails">
                            {property.images.map((image) => {
                                const thumbIsVideo = image.mimeType?.startsWith("video/");
                                return (
                                    <button
                                        key={image.id}
                                        className={`thumbnail-btn ${selectedImage?.id === image.id ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        {thumbIsVideo ? (
                                            <video src={image.url} muted />
                                        ) : (
                                            <img
                                                src={optimizeCloudinaryUrl(image.url, 150)}
                                                alt="Property thumbnail"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="property-info-section">
                    <div className="property-header">
                        <p className="property-location">
                            {property.street}, {property.city}, {property.country}
                        </p>
                    </div>

                    {property.description && (
                        <div className="property-description">
                            <h3 className="description-title">About {property.name}</h3>
                            <p className="description-text">{property.description}</p>
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
                        {property.hasElevator && (
                            <div className="stat-item">
                                <span className="stat-value">✓</span>
                                <span className="stat-label">Elevator</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Listings Section */}
                <div className="listings-section">
                    <h2 className="section-title">
                        Units
                        <span className="listing-count">
                            {availableListings.length} available
                        </span>
                    </h2>

                    {/* Filters */}
                    <div className="mb-4">
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
                                            <option key={floor} value={floor}>Floor {floor}</option>
                                        ))}
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
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <option key={n} value={n}>{n}+</option>
                                        ))}
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
                                        {/*<span className="input-group-text">-</span>*/}
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

                            <div className="row mt-3 pt-3 border-top">
                                <div className="col-auto">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="hasBalcony"
                                            name="hasBalcony"
                                            checked={filters.hasBalcony}
                                            onChange={handleFilterChange}
                                        />
                                        <label className="form-check-label" htmlFor="hasBalcony">
                                            Has Balcony
                                        </label>
                                    </div>
                                </div>

                                <div className="col-auto">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="showSold"
                                            name="showSold"
                                            checked={filters.showSold}
                                            onChange={handleFilterChange}
                                        />
                                        <label className="form-check-label" htmlFor="showSold">
                                            Show Sold
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {property.listings?.length > 0 ? (
                        <>
                            {applyFilters(property.listings).length > 0 ? (
                                <div className="listings-grid">
                                    {applyFilters(property.listings).map(listing => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            ) : (
                                <p className="no-listings">No units match your filters.</p>
                            )}
                        </>
                    ) : (
                        <p className="no-listings">No units available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}