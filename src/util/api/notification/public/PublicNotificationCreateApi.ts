import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');


export const subscribe = async (subscriptionData: NotificationSubscriptionDTO): Promise<void> => {
    try {
        await apiClient.post(`${BASE_URL}/send`, subscriptionData);
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