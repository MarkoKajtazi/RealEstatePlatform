// ListingTable.jsx
import React, { useState } from "react";
import trash from "../../assets/delete.svg";
import { Link } from "react-router-dom";
import { deleteListing } from "../../services/listingService.js";

export default function ListingTable({ listings = [], onDeleted }) {
    const [deletingId, setDeletingId] = useState(null);

    if (!Array.isArray(listings) || listings.length === 0) {
        return (
            <div className="my-3">
                <em>No listings available.</em>
            </div>
        );
    }

    const formatBool = (v) => (v ? "Yes" : "No");

    async function handleDelete(id) {
        const confirmed = window.confirm("Are you sure you want to delete this Listing?");
        if (!confirmed) return;

        try {
            setDeletingId(id);
            await deleteListing(String(id));

            if (typeof onDeleted === "function") {
                onDeleted(id);
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to delete listing", err);
            alert("Failed to delete listing. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <table className="table table-dark text-white" style={{ maxWidth: "100%" }}>
            <thead className="thead-dark text-center justify-content-center align-items-center">
            <tr>
                <th>Floor</th>
                <th>Square Meters</th>
                <th>Orientation</th>
                <th>Room Count</th>
                <th>Bathroom Count</th>
                <th>Balcony</th>
                <th>Price</th>
                <th>Available</th>
                <th>Actions</th>
            </tr>
            </thead>

            <tbody className="table-body text-center">
            {listings.map((l) => (
                <tr key={l.id}>
                    <td>{l.floor ?? "-"}</td>
                    <td>{l.squareMeters ?? "-"}</td>
                    <td>{l.orientation ?? "-"}</td>
                    <td>{l.roomCount ?? "-"}</td>
                    <td>{l.bathroomCount ?? "-"}</td>
                    <td>{formatBool(l.hasBalcony)}</td>
                    <td>
                        {typeof l.pricePerSquareMeter === "number"
                            ? Number(l.pricePerSquareMeter).toLocaleString()
                            : l.pricePerSquareMeter ?? "-"}
                    </td>
                    <td>{formatBool(l.available)}</td>

                    <td className="d-flex justify-content-center align-items-center">
                        <Link to={`/admin/listings/${l.id}/edit`} className="btn btn-sm btn-outline-light me-2">
                            Edit
                        </Link>

                        <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                            onClick={() => handleDelete(l.id)}
                            disabled={deletingId === l.id}
                            aria-disabled={deletingId === l.id}
                            title="Delete listing"
                        >
                            <img src={trash} alt="Delete" width="20" height="20" style={{ pointerEvents: "none" }} />
                            <span className="ms-1">{deletingId === l.id ? "Deleting..." : "Delete"}</span>
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
