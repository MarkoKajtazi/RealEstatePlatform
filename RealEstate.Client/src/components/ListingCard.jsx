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
    return orientations[orientation] || String(orientation);
}

export default function ListingCard({ listing }) {
    const totalPrice = listing.squareMeters * listing.pricePerSquareMeter;
    const floorPlanImage = listing.images?.find(
        (img) => img.type === IMAGE_TYPES.FLOOR_PLAN
    );

    return (
        <div
            className={`luxury-listing-card relative ${
                !listing.available ? "luxury-listing-unavailable" : ""
            }`}
        >
            {!listing.available && (
                <span className="luxury-listing-sold">Sold</span>
            )}

            {floorPlanImage && (
                <div className="luxury-listing-floorplan">
                    <img
                        src={optimizeCloudinaryUrl(floorPlanImage.url, 400)}
                        alt="Floor Plan"
                    />
                </div>
            )}

            <div className="luxury-listing-content">
                <div className="luxury-listing-price">
                    {totalPrice.toLocaleString()} EUR
                </div>
                <div className="luxury-listing-price-sqm">
                    {listing.pricePerSquareMeter.toLocaleString()} EUR / m²
                </div>

                <div className="luxury-listing-specs">
                    <div className="luxury-listing-spec">
            <span className="luxury-listing-spec-value">
              {listing.squareMeters}
            </span>
                        <span className="luxury-listing-spec-label">m²</span>
                    </div>
                    <div className="luxury-listing-spec">
            <span className="luxury-listing-spec-value">
              {listing.roomCount}
            </span>
                        <span className="luxury-listing-spec-label">Rooms</span>
                    </div>
                    <div className="luxury-listing-spec">
            <span className="luxury-listing-spec-value">
              {listing.bathroomCount}
            </span>
                        <span className="luxury-listing-spec-label">Baths</span>
                    </div>
                </div>

                <div className="luxury-listing-features">
          <span className="luxury-listing-feature">
            {getOrientationLabel(listing.orientation)} facing
          </span>
                    {listing.hasBalcony && (
                        <span className="luxury-listing-feature">Balcony</span>
                    )}
                </div>
            </div>
        </div>
    );
}
