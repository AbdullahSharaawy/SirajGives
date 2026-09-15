import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const createDonation = (payload) => api.post('/Donations', payload).then(unwrap);
export const getUserDonationHistory = (userId) => api.get(`/Donations/users/${userId}/history`, { skipAuthRedirect: true }).then(unwrap);
export const getCampaignDonationProgress = (campaignId) => api.get(`/Donations/campaigns/${campaignId}/progress`).then(unwrap);
export const getCampaignDonors = (campaignId) => api.get(`/Donations/campaigns/${campaignId}/donors`).then(unwrap);
export const getCampaignDonationTimeline = (campaignId) => api.get(`/Donations/campaigns/${campaignId}/timeline`).then(unwrap);