import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const getUserProfile = (userId) => {
  if (userId) {
    return api.get(`/User/${userId}`, { skipAuthRedirect: true }).then(unwrap);
  }
  return api.get('/User/profile', { skipAuthRedirect: true }).then(unwrap);
};

export const updateProfile = (payload) => api.put('/User', payload).then(unwrap);

export const changePassword = (payload) => api.put('/User/change-password', payload).then(unwrap);

export const requestPasswordReset = (email) =>
  api.post(
    '/User/forgot-password',
    {
      email,
      returnUrl: `${window.location.origin}/reset-password`,
    },
    { skipAuthRedirect: true }
  ).then(unwrap);

export const resetPassword = (payload) =>
  api.post(
    '/User/reset-password',
    {
      email: payload.email,
      token: payload.token,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      newPassword: payload.password,
    },
    { skipAuthRedirect: true }
  ).then(unwrap);

export const resendConfirmation = (email) =>
  api.post(
    '/User/resend-confirmation',
    {
      email,
      returnUrl: `${window.location.origin}/verify-email`,
    },
    { skipAuthRedirect: true }
  ).then(unwrap);