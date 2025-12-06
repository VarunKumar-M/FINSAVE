import axios from 'axios';

const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001',
});

const transactionApi = axios.create({
    baseURL: import.meta.env.VITE_TRANSACTION_API_URL || 'http://localhost:8002',
});

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8003',
});

// Add interceptor to add token to requests
const addTokenInterceptor = (instance) => {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

addTokenInterceptor(transactionApi);
addTokenInterceptor(analyticsApi);

export { authApi, transactionApi, analyticsApi };
