import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const getOrganizations = (params) => api.get('/Organization', { params, skipAuthRedirect: true }).then(unwrap);
export const getOrganization = (id) => api.get(`/Organization/${id}/details`, { skipAuthRedirect: true }).then(unwrap);
export const searchOrganizations = (term) => api.get('/Organization/search', { params: { term }, skipAuthRedirect: true }).then(unwrap);
export const getOrganizationCampaigns = (id) => api.get(`/Campaign/solo/by-organization/${id}`).then(unwrap);
export const getOrganizationContacts = (id) => api.get(`/Organization/${id}/contact-methods`).then(unwrap);
export const updateOrganization = (id, payload) => api.put(`/Organization/${id}`, payload).then(unwrap);
export const getOrganizationAdmin = (id) => api.get(`/Organization/${id}/admin`).then(unwrap);
export const getSubAdmins = (id) => api.get(`/Organization/${id}/sub-admins`).then(unwrap);