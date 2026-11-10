import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SETTINGS');

export const reset = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/reset`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.scheduleAlreadyCreated'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.dataNotReset'));
            }
        }
        throw error;
    }
}