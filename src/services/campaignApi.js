import api from './api';
import { asArray } from '../utils/normalize';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const getCampaigns = (params) => api.get('/Campaign', { params, skipAuthRedirect: true }).then((response) => asArray(unwrap(response)));
export const getSoloCampaigns = (params) => api.get('/Campaign/solo', { params, skipAuthRedirect: true }).then((response) => asArray(unwrap(response)));
export const getSharedCampaigns = (params) => api.get('/Campaign/shared', { params, skipAuthRedirect: true }).then((response) => asArray(unwrap(response)));
export const getCampaign = (id) => api.get(`/Campaign/${id}/details`, { skipAuthRedirect: true }).then(unwrap);
export const searchCampaigns = (term) => api.get('/Campaign/search', { params: { term }, skipAuthRedirect: true }).then(unwrap);
export const getCampaignsByOrganization = (organizationId, shared = false) =>
  api.get(`/Campaign/${shared ? 'shared' : 'solo'}/by-organization/${organizationId}`, { skipAuthRedirect: true }).then((response) => asArray(unwrap(response)));

export const createCampaign = (type, payload) => api.post(`/Campaign/${type}`, payload).then(unwrap);
export const updateCampaign = (type, id, payload) => api.put(`/Campaign/${type}/${id}`, payload).then(unwrap);
export const updateCampaignStatus = (id, status) => api.patch(`/Campaign/${id}/status`, null, { params: { status } }).then(unwrap);
export const deleteCampaign = (id) => api.delete(`/Campaign/${id}`);