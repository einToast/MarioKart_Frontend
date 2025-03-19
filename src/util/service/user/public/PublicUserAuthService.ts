import { AuthenticationRequestDTO } from "../../../api/config/dto";
import { User } from "../../../api/config/interfaces";
import { PublicUserApi } from "../../../api";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const login = async (username: string, password: string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    const response = await PublicUserApi.login(user);
    setToken(response.accessToken);
};

//TODO: new file?
export const setToken = (token: string): void => {
    Cookies.set('authToken', token, { expires: 1, sameSite: 'strict' });
};

export const getToken = (): string | null => {
    try {
        return Cookies.get('authToken') ?? null;
    } catch (e) {
        console.error('Error getting token:', e);
        return null;
    }
};

export const removeToken = (): void => {
    Cookies.remove('authToken');
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

export const setUser = (user: User): void => {
    Cookies.set('user', JSON.stringify(user), { expires: 1, sameSite: 'strict' });
}

export const getUser = (): User | null => {
    try {
        return JSON.parse(Cookies.get('user') ?? '{}') as User;
    } catch (e) {
        console.error('Error getting user:', e);
        return null;
    }
}

export const removeUser = (): void => {
    Cookies.remove('user');
}

export const setSelectedGamesOption = (option: string): void => {
    Cookies.set('selectedGamesOption', option, { expires: 1, sameSite: 'strict' });
}

export const getSelectedGamesOption = (): string | null => {
    try {
        return Cookies.get('selectedGamesOption') ?? null;
    } catch (e) {
        console.error('Error getting selected games option', e);
        return null;
    }
}