import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'NOTIFICATION');

export const getSubscriptionCount = async (): Promise<number> => {
    try {
        const response = await apiClient.get<number>(`${BASE_URL}/subscriptions/count`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.subscriptionCountNotLoaded'));
            }
        }
        throw error;
    }
};
