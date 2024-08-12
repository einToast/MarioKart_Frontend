import axios from 'axios';
import { getToken } from '../../service/adminService';

// Create an Axios instance
const apiClient = axios.create();

// Add a request interceptor
apiClient.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default apiClient;