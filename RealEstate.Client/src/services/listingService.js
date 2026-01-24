import api from "./apiClient.js";

export const fetchListings = () =>
    api.get('/listings')
        .then(res => res.data);

export const fetchListing = (id) =>
    api.get(`/listings/${id}`).then(res => res.data);

export const createListings = (payload) =>
    api.post(`/listings`, payload).then(res => res.data);

export const updateListing = (id, payload) =>
    api.put(`/listings/${id}`, payload).then(res => res.data);

export const deleteListing = (id) =>
    api.delete(`/listings/${id}`).then(res => res.data);

export const insertFloorPlan = (id, payload) =>
    api.post(`/listings/${id}/images`, payload).then(res => res.data);

export const deleteListingFloorPlan = (id, floorPlanId) =>
    api.delete(`/listings/${id}/images/${floorPlanId}`).then(res => res.data);

export const fetchFloorPlanPins = (id) =>
    api.get(`/listings/${id}/pins`).then(res => res.data);

export const createFloorPlanPin = (id, formData) =>
    api.post(`/listings/${id}/pins`, formData).then(res => res.data);