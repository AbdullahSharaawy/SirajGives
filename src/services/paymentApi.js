import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const createPayment = (payload) => api.post('/Payment/create', payload).then(unwrap);