import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from "../config/constants";

const BASE_URL = `${API_BASE_URL}/users`;

export const deleteUser = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Nutzer konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
};