import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const createPayment = (payload) => api.post('/Payment/create', payload).then(unwrap);

export const getPaymentInfoByOrganization = (orgId) =>
  api.get(`/PaymentInfo/by-organization/${orgId}`).then(unwrap);

export const getPaymentInfoById = (paymentInfoId) =>
  api.get(`/PaymentInfo/${paymentInfoId}`).then(unwrap);

export const createPaymentInfo = (payload) =>
  api.post('/PaymentInfo', payload).then(unwrap);

export const updatePaymentInfo = (paymentInfoId, payload) =>
  api.put(`/PaymentInfo/${paymentInfoId}`, payload).then(unwrap);

export const deletePaymentInfo = (paymentInfoId) =>
  api.delete(`/PaymentInfo/${paymentInfoId}`).then(unwrap);

export const hasPaymentInfo = (orgId) =>
  api.get(`/PaymentInfo/has/${orgId}`).then(unwrap);