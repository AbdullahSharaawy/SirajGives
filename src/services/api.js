// src/services/api.js
import axios from 'axios';
import config from '../config';
const api = axios.create({
  baseURL: `${config.backendUrl}/api`, // Replace with your actual backend URL
});
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const claims = decodeClaims(token);
    if (!claims.exp) return false;
    return claims.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getInitialToken = () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken && isTokenExpired(savedToken)) {
    localStorage.removeItem('token');
    return null;
  }
  return savedToken;
};

const decodeClaims = (token) => {
  try {
    if (!token) return {};
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

const isManagementRoute = () =>
  window.location.pathname.startsWith('/admin')
  || window.location.pathname.startsWith('/org-admin');

// Request Interceptor: Attach the bearer token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getInitialToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically handle 401 Unauthorized errors (expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const onLoginPage = window.location.pathname === '/login';
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect && !isManagementRoute() && !onLoginPage) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;