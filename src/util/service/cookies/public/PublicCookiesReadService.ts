import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { User } from "../../../api/config/interfaces";
import { removeToken } from "./PublicCookiesDeleteService";

export const getToken = (): string | null => {
    try {
        return Cookies.get('authToken') ?? null;
    } catch (e) {
        console.error('Error getting token:', e);
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    const decodedToken = jwtDecode(token);
    const expirationTimeInSeconds = decodedToken.exp;

    if (!expirationTimeInSeconds) {
        return true;
    }

    const currentDateTime = new Date().getTime() / 1000;
    return expirationTimeInSeconds < currentDateTime;
};

export const checkToken = (): boolean => {
    const token = getToken();
    if (!token) {
        removeToken();
        return false;
    }
    if (isTokenExpired(token)) {
        removeToken();
        return false;
    }
    return true;
};

export const getUser = (): User | null => {
    try {
        return JSON.parse(Cookies.get('user') ?? '{}') as User;
    } catch (e) {
        console.error('Error getting user:', e);
        return null;
    }
};

export const getSelectedGamesOption = (): string | null => {
    try {
        return Cookies.get('selectedGamesOption') ?? null;
    } catch (e) {
        console.error('Error getting selected games option', e);
        return null;
    }
};

export const getNotificationsEnabled = (): boolean => {
    try {
        return JSON.parse(Cookies.get('notificationsEnabled') ?? 'false') as boolean;
    } catch (e) {
        console.error('Error getting notifications enabled:', e);
        return false;
    }
};