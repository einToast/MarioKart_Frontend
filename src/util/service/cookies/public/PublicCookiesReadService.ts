import Cookies from "js-cookie";
import { User } from "../../../api/config/interfaces";
import { check as checkAuthCookie } from "../../user/public/PublicUserAuthService";
import { removeUser } from "./PublicCookiesDeleteService";

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

export const checkToken = async (): Promise<boolean> => {
    try {
        await checkAuthCookie();
        return true;
    } catch (error) {
        console.error('Cookie validation failed:', error);
        removeUser();
        return false;
    }
};
