import Cookies from "js-cookie";

export const removeUser = (): void => {
    Cookies.remove('user');
};
