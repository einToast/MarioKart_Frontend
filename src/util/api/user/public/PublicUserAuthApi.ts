import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { AuthenticationRequestDTO, AuthenticationResponseDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'USER');

export const login = async (request: AuthenticationRequestDTO): Promise<AuthenticationResponseDTO> => {
    try {
        const response = await apiClient.post<AuthenticationResponseDTO>(`${BASE_URL}/login`, request);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nutzername oder Passwort ist falsch');
            } else {
                throw new Error('Login fehlgeschlagen');
            }
        }
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await apiClient.post<void>(`${BASE_URL}/logout`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Logout fehlgeschlagen');
        }
        throw error;
    }
};

export const check = async (): Promise<AuthenticationResponseDTO> => {
    try {
        const response = await apiClient.get<AuthenticationResponseDTO>(`${BASE_URL}/login/check`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error('Login abgelaufen');
        }
        throw error;
    }
};
