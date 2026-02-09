import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/properties.css";
import Navigation from "@/components/Navigation.jsx";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {fetchProperties} from "@/services/propertyService.js";

// function optimizeCloudinaryUrl(url, width = 1200) {
//     if (!url || !url.includes("cloudinary.com")) return url;
//     return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
// }

function PropertyCard({property}) {
    const rawUrl = property.images?.[0]?.url || "/placeholder-property.jpg";
    // const imageUrl = optimizeCloudinaryUrl(rawUrl);
    const imageUrl = rawUrl;
    const propertyType = property.propertyType === 0 ? "Building" : "House";

    return (
        <div className="property-card-wrapper">
            <div className="property-card">
                <img
                    src={imageUrl}
                    alt={property.name}
                    loading="lazy"
                    decoding="async"
                />
                <div className="property-overlay">
                    <div className="property-info">
                        <div className="d-flex gap-2 align-items-center">
                            <span className="property-type">{propertyType}</span>
                            <h2 className="property-name">{property.name}</h2>
                        </div>
                        <p className="property-location">
                            {property.city}, {property.country}
                        </p>
                        <p className="property-details">
                            {property.squareMeters} m² • {property.floorCount} floors
                        </p>
                        {property.listings?.length > 0 && (
                            <p className="property-listings">
                                {property.listings.filter(l => l.available).length} available listings
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties()
            .then(data => setProperties(data))
            .catch(err => console.error("Failed to load properties:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navigation/>
                <div className="loading">Loading properties...</div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navigation/>
            <div className="properties-container">
                {properties.map((property) => (
                    <Link
                        key={property.id}
                        to={`/properties/${property.id}`}
                        className="property-link"
                    >
                        <PropertyCard property={property}/>
                    </Link>
                ))}
            </div>
        </div>
    );
}