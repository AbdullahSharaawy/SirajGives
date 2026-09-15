import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const getUsers = async (showDeleted = false) => {
  const response = await api.get('/User', { params: { showDeleted } });
  return asArray(unwrap(response));
};

export const deleteUser = (id) => api.delete(`/User/${id}`);

export const restoreUser = (id) => api.get(`/User/restore/${id}`);

export const seedSuperAdmin = () => api.post('/User/seed-superadmin');

export const getOrganizations = async (includeDeleted = true) => {
  const response = await api.get('/Organization', { params: { includeDeleted } });
  return asArray(unwrap(response));
};

export const getDeletedOrganizations = async () => {
  const response = await api.get('/Organization/deleted');
  return asArray(unwrap(response));
};

export const createOrganization = (payload) => api.post('/Organization', payload);

export const updateOrganization = (id, payload) => api.put(`/Organization/${id}`, payload);

export const deleteOrganization = (id) => api.delete(`/Organization/${id}`);

export const restoreOrganization = (id) => api.patch(`/Organization/${id}/restore`);

export const assignOrganizationAdmin = (organizationId, userId) =>
  api.post(`/Organization/${organizationId}/admin`, { userId });

export const getCampaigns = async (includeDeleted = true) => {
  const response = await api.get('/Campaign', { params: { includeDeleted } });
  return asArray(unwrap(response));
};

export const getHomeData = async () => {
  const results = await Promise.allSettled([
    api.get('/Campaign/trending/top-by-achievement', { skipAuthRedirect: true }),
    api.get('/Campaign/trending/urgent', { skipAuthRedirect: true }),
    api.get('/Organization/recent', { params: { days: 365 }, skipAuthRedirect: true }),
    api.get('/Campaign/statistics/dashboard', { skipAuthRedirect: true }),
    api.get('/Campaign/statistics/total-money', { skipAuthRedirect: true }),
  ]);

  const valueAt = (index) => results[index].status === 'fulfilled'
    ? unwrap(results[index].value)
    : null;

  return {
    trendingCampaigns: asArray(valueAt(0)),
    urgentCampaigns: asArray(valueAt(1)),
    organizations: asArray(valueAt(2)),
    campaignStats: valueAt(3) || {},
    totalDonations: valueAt(4),
    hasErrors: results.some((result) => result.status === 'rejected'),
  };
};

export const updateCampaignStatus = (id, status) => api.patch(`/Campaign/${id}/status`, null, { params: { status } });

export const deleteExpiredCampaigns = () => api.delete('/Campaign/bulk/delete-expired');

export const autoExpireCampaigns = () => api.post('/Campaign/auto-expire');

export const deleteCampaign = (id) => api.delete(`/Campaign/${id}`);

export const restoreCampaign = (id) => api.patch(`/Campaign/${id}/restore`);

export const getDonationStats = async () => {
  const [amount, count, donors, campaigns, trend, suspicious] = await Promise.all([
    api.get('/Donations/stats/total-amount'),
    api.get('/Donations/stats/total-count'),
    api.get('/Donations/analytics/top-donors', { params: { limit: 5 } }),
    api.get('/Donations/analytics/top-campaigns', { params: { limit: 5 } }),
    api.get('/Donations/analytics/trend', { params: { days: 120 } }),
    api.get('/Donations/audit/suspicious'),
  ]);
  return {
    amount: unwrap(amount),
    count: unwrap(count),
    donors: asArray(unwrap(donors)),
    campaigns: asArray(unwrap(campaigns)),
    trend: asArray(unwrap(trend)),
    suspicious: asArray(unwrap(suspicious)),
  };
};

export const getItemStats = async () => {
  const [count, available, distribution, donors] = await Promise.all([
    api.get('/DonatedItem/count'),
    api.get('/DonatedItem/availabl/count'),
    api.get('/DonatedItem/categories/distribution'),
    api.get('/DonatedItem/top-donors', { params: { top: 5 } }),
  ]);
  return {
    count: unwrap(count),
    available: unwrap(available),
    distribution: asArray(unwrap(distribution)),
    donors: asArray(unwrap(donors)),
  };
};

export const deleteOldItems = (daysOld) => api.delete('/DonatedItem/delete-old', { params: { daysOld } });

export const getAdminOverview = async () => {
  const [users, campaigns, organizations, donations] = await Promise.all([
    api.get('/User', { skipAuthRedirect: true }),
    api.get('/Campaign/statistics/dashboard', { skipAuthRedirect: true }),
    api.get('/Organization/count/total', { skipAuthRedirect: true }),
    api.get('/Donations/stats/total-amount', { skipAuthRedirect: true }),
  ]);
  return {
    users: asArray(unwrap(users)).length,
    campaigns: unwrap(campaigns),
    organizations: unwrap(organizations),
    donations: unwrap(donations),
  };
};
