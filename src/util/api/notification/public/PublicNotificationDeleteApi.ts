import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionEndpointDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');

export const unsubscribe = async (subscription: NotificationSubscriptionEndpointDTO): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/subscription`, { data: subscription });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.notificationsNotDisabled'));
        }
        throw error;
    }
};
