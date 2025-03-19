import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { AuthenticationRequestDTO, AuthenticationResponseDTO } from '../../config/dto';

const BASE_URL = `${API_BASE_URL}${ApiPath.createPath('PUBLIC', 'USER')}`;

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
