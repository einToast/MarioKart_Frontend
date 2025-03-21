import axios from 'axios';
import { PublicUserService } from '../../service';
import { API_BASE_URL } from './constants';

// Create an Axios instance
const apiClient = axios.create({
    withCredentials: true,
    baseURL: API_BASE_URL,
});

// Add a request interceptor
apiClient.interceptors.request.use(
    config => {
        const token = PublicUserService.getToken();
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
export class ApiPath {
    static readonly API = {
        ADMIN: 'admin',
        PUBLIC: 'public'
    };

    static readonly CONTROLLER = {
        REGISTRATION: 'teams',
        SCHEDULE: 'schedule',
        SETTINGS: 'settings',
        SURVEY: 'survey',
        USER: 'user'
    };

    static createPath(apiType: keyof typeof ApiPath.API, controller: keyof typeof ApiPath.CONTROLLER): string {
        return `/${ApiPath.API[apiType]}/${ApiPath.CONTROLLER[controller]}`;
    }
}
