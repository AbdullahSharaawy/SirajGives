import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const updateProfile = (payload) => api.put('/User', payload).then(unwrap);
export const changePassword = (payload) => api.put('/User/change-password', payload).then(unwrap);