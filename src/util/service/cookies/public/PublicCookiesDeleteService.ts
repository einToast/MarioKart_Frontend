import Cookies from "js-cookie";

export const removeToken = (): void => {
    Cookies.remove('authToken');
};

export const removeUser = (): void => {
    Cookies.remove('user');
};