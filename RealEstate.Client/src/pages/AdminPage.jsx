import React from "react";
import {Link, Outlet} from "react-router-dom";
import PropertiesSidebar from "../features/property/PropertiesSidebar.jsx";
import "./styles/admin.css"

export default function AdminPage() {
    return (
        <div className="admin-wrapper d-flex p-0">
            <aside
                id="sidebar"
                className="bg-dark text-white flex-shrink-0"
                style={{ width: 280, minWidth: 220, height: "100vh", overflowY: "auto" }}
            >
                <div className="p-3">
                    <Link to="/home" className="btn btn-sm btn-outline-light mb-3">
                        ← Home
                    </Link>
                    <PropertiesSidebar compact />
                </div>
            </aside>

            <main className="flex-grow-1 p-0 m-0" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                <div className="container p-3 h-100 d-flex flex-column" style={{ minHeight: 0 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};