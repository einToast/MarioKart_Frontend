import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from "../config/constants";
import {
    AuthenticationRequestDTO,
    AuthenticationResponseDTO,
    UserCreationDTO,
    UserTokenDTO
} from '../config/dto';

const BASE_URL = `${API_BASE_URL}/users`;

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

export const createUsers = async (userCreations: UserCreationDTO[]): Promise<UserTokenDTO[]> => {
    try {
        const response = await apiClient.post<UserTokenDTO[]>(BASE_URL, userCreations);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnte nicht erstellt werden');
            }
        }
        throw error;
    }
};