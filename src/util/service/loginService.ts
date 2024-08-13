import {AuthenticationRequestDTO} from "../api/config/dto";
import {login} from "../api/UserApi";
import {jwtDecode} from "jwt-decode";

export const loginUser = async (username: string, password: string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    const response = await login(user);
    setToken(response.accessToken);
};
export const setToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};
export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};
export const removeToken = (): void => {
    localStorage.removeItem('authToken');
};
const isTokenExpired = (token: string): boolean => {
    const decodedToken = jwtDecode(token);
    const expirationTimeInSeconds = decodedToken.exp;

    if (!expirationTimeInSeconds) {
        return true;
    }

    const currentDateTime = new Date().getTime() / 1000;

    return expirationTimeInSeconds < currentDateTime;
}
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
}

export const setUser = (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
}

export const getUser = (): any => {
    return JSON.parse(localStorage.getItem('user'));
}

export const removeUser = (): void => {
    localStorage.removeItem('user');
}