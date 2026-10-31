import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'NOTIFICATION');

export const getSubscriptionCount = async (): Promise<number> => {
    try {
        const response = await apiClient.get<number>(`${BASE_URL}/subscriptions/count`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Anzahl der Abonnements konnte nicht geladen werden');
            }
        }
        throw error;
    }
};
