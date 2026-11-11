import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionDTO, NotificationSubscriptionLanguageDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');


export const subscribe = async (subscriptionData: NotificationSubscriptionDTO): Promise<void> => {
    try {
        await apiClient.post(`${BASE_URL}/subscribe`, subscriptionData);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else if (error.response?.status === 500) {
                throw new Error(i18n.t('errors.notificationsNotEnabled'));
            } else {
                throw new Error(i18n.t('errors.notificationsNotEnabled'));
            }
        }
        throw error;
    }
};

export const updateLanguage = async (update: NotificationSubscriptionLanguageDTO): Promise<void> => {
    await apiClient.put(`${BASE_URL}/subscription/language`, update);
};