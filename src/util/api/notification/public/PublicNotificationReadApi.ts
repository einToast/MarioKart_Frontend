import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');

export const getPublicKey = async (): Promise<string> => {
    try {
        const response = await apiClient.get<string>(`${BASE_URL}/public-key`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Öffentlicher Schlüssel konnte nicht geladen werden');
            }
        }
        throw error;
    }
};