import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

// CRUD Operations
export const getAllDonations = (params) =>
  api.get('/Donations', { params }).then(unwrap);

export const getDonationsByOrganization = (orgId, params) =>
  api.get(`/Donations/by-organization/${orgId}`, { params }).then(unwrap);

export const getDonationById = (id) =>
  api.get(`/Donations/${id}`).then(unwrap);

export const getDonationWithDetails = (id) =>
  api.get(`/Donations/${id}/details`).then(unwrap);

export const createDonation = (payload) =>
  api.post('/Donations', payload).then(unwrap);

export const updateDonation = (id, payload) =>
  api.put(`/Donations/${id}`, payload).then(unwrap);

export const deleteDonation = (id) =>
  api.delete(`/Donations/${id}`).then(unwrap);

export const restoreDonation = (id) =>
  api.patch(`/Donations/${id}/restore`).then(unwrap);

// Filtering & Search
export const getDeletedDonations = (params) =>
  api.get('/Donations/deleted', { params }).then(unwrap);

export const getRecentDonations = (params) =>
  api.get('/Donations/recent', { params }).then(unwrap);

// Campaign & User specific
export const getUserDonationHistory = (userId) =>
  api.get(`/Donations/users/${userId}/history`, { skipAuthRedirect: true }).then(unwrap);

export const getDonationsByCampaign = (campaignId) =>
  api.get(`/Donations/by-campaign/${campaignId}`).then(unwrap);

export const getCampaignDonationProgress = (campaignId) =>
  api.get(`/Donations/campaigns/${campaignId}/progress`).then(unwrap);

export const getCampaignDonors = (campaignId) =>
  api.get(`/Donations/campaigns/${campaignId}/donors`).then(unwrap);

export const getCampaignDonationTimeline = (campaignId) =>
  api.get(`/Donations/campaigns/${campaignId}/timeline`).then(unwrap);

export const getCampaignTotalRaised = (campaignId) =>
  api.get(`/Donations/campaigns/${campaignId}/total-raised`).then(unwrap);

export const getCampaignDonationsCount = (campaignId) =>
  api.get(`/Donations/stats/count/by-campaign/${campaignId}`).then(unwrap);