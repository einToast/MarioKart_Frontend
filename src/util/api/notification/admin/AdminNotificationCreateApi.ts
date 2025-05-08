import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'NOTIFICATION');

export const sendNotificationToAll = async (title: string, message: string): Promise<void> => {
    try {
        await apiClient.post(`${BASE_URL}/send`, {
            title,
            message
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 500) {
                throw new Error('Benachrichtigung konnte nicht gesendet werden');
            } else {
                throw new Error('Finalrunden konnten nicht erstellt werden');
            }
        }
        throw error;
    }
};

export const sendNotificationToTeam = async (teamId: number, title: string, message: string): Promise<void> => {
    try {
        await apiClient.post(`${BASE_URL}/send/${teamId}`, {
            title,
            message
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 500) {
                throw new Error('Benachrichtigung konnte nicht gesendet werden');
            } else {
                throw new Error('Finalrunden konnten nicht erstellt werden');
            }
        }
        throw error;
    }
};