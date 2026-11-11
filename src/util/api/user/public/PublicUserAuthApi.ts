import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { AuthenticationRequestDTO, AuthenticationResponseDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'USER');

export const login = async (request: AuthenticationRequestDTO): Promise<AuthenticationResponseDTO> => {
    try {
        const response = await apiClient.post<AuthenticationResponseDTO>(`${BASE_URL}/login`, request);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.wrongCredentials'));
            } else {
                throw new Error(i18n.t('errors.loginFailed'));
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
            throw new Error(i18n.t('errors.logoutFailed'));
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
            throw new Error(i18n.t('errors.loginExpired'));
        }
        throw error;
    }
};
