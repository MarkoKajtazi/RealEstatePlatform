import api from "./apiClient.js";

export const fetchProperties = () =>
    api.get('/properties')
        .then(res => res.data);

export const fetchProperty = (id) =>
    api.get(`/properties/${id}`).then(res => res.data);

export const deleteProperty = (id) =>
    api.delete(`/properties/${id}`).then(res => res.data);

export const createProperty = (payload) =>
    api.post(`/properties`, payload).then(res => res.data);

export const updateProperty = (id, payload) =>
    api.put(`/properties/${id}`, payload).then(res => res.data);

export const insertPropertyImage = (id, payload) =>
    api.post(`/properties/${id}/images`, payload).then(res => res.data);

export const deleteImage = (id, imageId) =>
    api.delete(`/properties/${id}/images/${imageId}`).then(res => res.data);
