import Cookies from "js-cookie";
import { User } from "../../../api/config/interfaces";

export const setUser = (user: User): void => {
    Cookies.set('user', JSON.stringify(user), { expires: 1, sameSite: 'strict', secure: true });
};

export const setSelectedGamesOption = (option: string): void => {
    Cookies.set('selectedGamesOption', option, { expires: 1, sameSite: 'strict', secure: true });
};

export const setNotificationsEnabled = (enabled: boolean): void => {
    Cookies.set('notificationsEnabled', JSON.stringify(enabled), { expires: 1, sameSite: 'strict', secure: true });
}
