import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationRequestDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'NOTIFICATION');

export const sendNotificationToAll = async (notification: NotificationRequestDTO): Promise<void> => {
    console.log('sendNotificationToAll', notification);
    try {
        await apiClient.post(`${BASE_URL}/send`, notification);
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

export const sendNotificationToTeam = async (teamId: number, notification: NotificationRequestDTO): Promise<void> => {
    console.log('sendNotificationToTeam', teamId, notification);
    
    try {
        await apiClient.post(`${BASE_URL}/send/${teamId}`, notification);
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