import {login} from "../api/UserApi";
import {jwtDecode} from 'jwt-decode';
import {AuthenticationRequestDTO, AuthenticationResponseDTO} from "../api/config/dto";

export const loginUser = async (username:string, password:string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    const response = await login(user);
    setToken(response.accessToken);
}

export const setToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};

export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const removeToken = (): void => {
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