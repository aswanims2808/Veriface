import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('veriface_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Prevent redirect loop - don't redirect if 401 comes from login endpoint
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            // Token expired or invalid - clear storage
            console.log('Session expired or invalid token. API returned 401.');
            // localStorage.removeItem('veriface_token');
            // localStorage.removeItem('veriface_user');

            // Redirect disabled as per no-auth requirement
            // if (!window.location.pathname.includes('/login')) {
            //    window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

export const authAPI = {
    register: async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },

    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('veriface_token', response.data.token);
            localStorage.setItem('veriface_user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    verify: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('veriface_token');
        localStorage.removeItem('veriface_user');
    },
};

// ==================== USER API ====================

export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },
};

// ==================== ANALYSIS API ====================

export const analysisAPI = {
    predict: async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.type) {
            formData.append('detection_type', options.type);
        }

        const response = await api.post('/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getHistory: async (page = 1, perPage = 10) => {
        const response = await api.get('/history', {
            params: { page, per_page: perPage },
        });
        return response.data;
    },

    getAnalysis: async (analysisId) => {
        const response = await api.get(`/history/${analysisId}`);
        return response.data;
    },

    deleteAnalysis: async (analysisId) => {
        const response = await api.delete(`/history/${analysisId}`);
        return response.data;
    },

    shareAnalysis: async (analysisId) => {
        const response = await api.post(`/history/${analysisId}/share`);
        return response.data;
    },

    getSharedAnalysis: async (token) => {
        const response = await api.get(`/api/share/${token}`);
        return response.data;
    },
};

export default api;
