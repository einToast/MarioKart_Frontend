import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from '../../config/constants';

const BASE_URL = `${API_BASE_URL}${ApiPath.createPath('ADMIN', 'SETTINGS')}`;

export const reset = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/reset`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Daten konnten nicht zurückgesetzt werden');
            }
        }
        throw error;
    }
}