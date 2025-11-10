// PropertiesSidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {fetchProperties} from "../../services/propertyService.js";

export default function PropertiesSidebar({ compact = false }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const data = await fetchProperties();
                if (!mounted) return;
                setProperties(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load properties", err);
                if (mounted) setProperties([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="w-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="m-0 text-white">Properties</h6>
                <Link to="/admin/properties/new" className="btn btn-sm btn-outline-light">New</Link>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border text-light" role="status" aria-hidden="true"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="text-muted">No properties</div>
            ) : (
                <ul className="list-group list-group-flush">
                    {properties.map((p) => (
                        <li key={p.id} className="list-group-item p-0 border-0 bg-transparent">
                            <NavLink
                                to={`/admin/properties/${p.id}`}
                                className="list-group-item list-group-item-action bg-transparent text-white"
                                style={{ borderRadius: 6, margin: "4px 0", padding: "8px 12px" }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="fw-semibold" style={{ fontSize: compact ? 14 : 15 }}>
                                        {p.name || "Untitled"}
                                    </div>
                                    <small className="text-muted">{p.city ?? ""}</small>
                                </div>
                                {!compact && p.street && <small className="d-block text-muted">{p.street}</small>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
