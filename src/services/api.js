// src/services/api.js
import axios from 'axios';
import config from '../config';
const api = axios.create({
  baseURL: `${config.backendUrl}/api`, // Replace with your actual backend URL
});

const isManagementRoute = () =>
  window.location.pathname.startsWith('/admin')
  || window.location.pathname.startsWith('/org-admin');

// Request Interceptor: Attach the bearer token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
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