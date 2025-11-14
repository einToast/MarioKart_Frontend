import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create an Axios instance
const apiClient = axios.create({
    withCredentials: true,
    baseURL: API_BASE_URL,
});

export default apiClient;
export class ApiPath {
    static readonly API = {
        ADMIN: 'admin',
        PUBLIC: 'public'
    };

    static readonly CONTROLLER = {
        NOTIFICATION: 'notification',
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
