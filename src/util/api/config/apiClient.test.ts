import apiClient, { ApiPath } from './apiClient';
import { API_BASE_URL, WS_BASE_URL } from './constants';

describe('ApiPath.createPath', () => {
    it.each([
        ['ADMIN', 'NOTIFICATION', '/admin/notification'],
        ['ADMIN', 'REGISTRATION', '/admin/teams'],
        ['ADMIN', 'SCHEDULE', '/admin/schedule'],
        ['ADMIN', 'SETTINGS', '/admin/settings'],
        ['ADMIN', 'SURVEY', '/admin/survey'],
        ['PUBLIC', 'NOTIFICATION', '/public/notification'],
        ['PUBLIC', 'REGISTRATION', '/public/teams'],
        ['PUBLIC', 'SCHEDULE', '/public/schedule'],
        ['PUBLIC', 'SETTINGS', '/public/settings'],
        ['PUBLIC', 'SURVEY', '/public/survey'],
        ['PUBLIC', 'USER', '/public/user'],
    ] as const)('maps %s + %s to %s', (apiType, controller, expected) => {
        expect(ApiPath.createPath(apiType, controller)).toBe(expected);
    });
});

describe('base URLs', () => {
    it('builds the REST base URL from the REACT_APP_BACKEND_* variables', () => {
        expect(API_BASE_URL).toBe('http://localhost:8080/api');
    });

    it('builds the WebSocket base URL from the REACT_APP_BACKEND_WS_* variables', () => {
        expect(WS_BASE_URL).toBe('http://localhost:8080/api/ws');
    });
});

describe('apiClient', () => {
    it('targets the backend base URL', () => {
        expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
    });

    it('sends the session cookie with every request', () => {
        expect(apiClient.defaults.withCredentials).toBe(true);
    });
});
