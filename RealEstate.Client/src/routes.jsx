import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import PropertyForm from "./features/property/PropertyForm.jsx";
import PropertyDetails from "./features/property/PropertyDetails.jsx";
import ListingForm from "./features/listing/ListingForm.jsx";
import PropertiesPage from "@/pages/PropertiesPage.jsx";
import PropertyDetailPage from "@/pages/PropertyDetailPage.jsx";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />

                <Route path="/admin" element={<AdminPage />}>
                    <Route path="properties/:id" element={<PropertyDetails />} />
                    <Route path="properties/new" element={<PropertyForm />} />
                    <Route path="properties/:id/edit" element={<PropertyForm />} />

                    <Route path="listings/new/:propertyId" element={<ListingForm />} />
                    <Route path="listings/:id/edit" element={<ListingForm />} />

                </Route>

                <Route path="*" element={<div>404</div>} />
            </Routes>
        </BrowserRouter>
    );
}