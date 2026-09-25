import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const getOrganizations = (params) => api.get('/Organization', { params, skipAuthRedirect: true }).then(unwrap);
export const getOrganization = (id) => api.get(`/Organization/${id}/details`, { skipAuthRedirect: true }).then(unwrap);
export const searchOrganizations = (term) => api.get('/Organization/search', { params: { term }, skipAuthRedirect: true }).then(unwrap);
export const getOrganizationCampaigns = (id) => api.get(`/Campaign/solo/by-organization/${id}`).then(unwrap);
export const getOrganizationSoloCampaigns = (id,showDeleted) => api.get(`/Campaign/solo/by-organization/${id}`,{params:{showDeleted}}).then(unwrap);
export const getOrganizationSharedCampaigns = (id,showDeleted) => api.get(`/Campaign/shared/by-organization/${id}`,{params:{showDeleted}}).then(unwrap);

// Contact methods
export const getOrganizationContacts = (id) => api.get(`/Organization/${id}/contact-methods`).then(unwrap);
export const addOrgContactMethod = (orgId, payload) =>
  api.post('/Organization/contact-methods', payload, { params: { organizationId: orgId } }).then(unwrap);
export const updateOrgContactMethod = (orgId, contactId, payload) =>
  api.put(`/Organization/contact-methods/${contactId}`, payload, { params: { organizationId: orgId } }).then(unwrap);
export const deleteOrgContactMethod = (orgId, contactId) =>
  api.delete(`/Organization/contact-methods/${contactId}`, { params: { organizationId: orgId } }).then(unwrap);

// Profile
export const updateOrganization = (id, payload) => api.put(`/Organization/${id}`, payload).then(unwrap);

// Admin & Sub-admins
export const getOrganizationAdmin = (id) => api.get(`/Organization/${id}/admin`).then(unwrap);
export const getSubAdmins = (id) => api.get(`/Organization/${id}/sub-admins`).then(unwrap);
export const addSubAdmin = (orgId, userId) => api.post(`/Organization/${orgId}/sub-admins`, { userId }).then(unwrap);
export const removeSubAdmin = (orgId, userId) => api.delete(`/Organization/${orgId}/sub-admins/${userId}`).then(unwrap);
export const isUserSubAdmin = (orgId, userId) => api.get(`/Organization/${orgId}/sub-admins/${userId}/check`).then(unwrap);

// Organization Roles Entity
export const getOrganizationRoles = (params = { limit: 1000, page: 1 }) =>
  api.get('/OrganizationRole', { params, skipAuthRedirect: true }).then((res) => {
    const data = unwrap(res);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  });
export const getUserOrganizationRole = (orgId, userId) =>
  api.get(`/OrganizationRole/${orgId}/organizations/${userId}/users`, { skipAuthRedirect: true }).then(unwrap);
