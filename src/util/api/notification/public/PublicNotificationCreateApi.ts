import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');


export const subscribe = async (subscriptionData: NotificationSubscriptionDTO): Promise<void> => {
    try {
        await apiClient.post(`${BASE_URL}/subscribe`, subscriptionData);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 500) {
                throw new Error('Benachrichtigungen konnten nicht aktiviert werden');
            } else {
                throw new Error('Benachrichtigungen konnten nicht aktiviert werden');
            }
        }
        throw error;
    }
};