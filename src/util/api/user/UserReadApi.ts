import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from "../config/constants";
import { UserDTO } from '../config/dto';

const BASE_URL = `${API_BASE_URL}/users`;

export const getUsers = async (): Promise<UserDTO[]> => {
    try {
        const response = await apiClient.get<UserDTO[]>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnten nicht geladen werden');
            }
        }
        throw error;
    }
};