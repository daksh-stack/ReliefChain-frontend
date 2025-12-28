import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me')
};

// Request APIs
export const requestAPI = {
    submit: (data) => api.post('/request', data),
    getQueue: () => api.get('/queue'),
    dequeue: () => api.post('/dequeue'),
    updateStatus: (id, status) => api.put(`/update-status/${id}`, { status }),
    getMyRequests: () => api.get('/my-requests'),
    getAssignedRequests: () => api.get('/assigned-requests'),
    getStats: () => api.get('/stats'),
    getConfig: () => api.get('/config')
};

export default api;
