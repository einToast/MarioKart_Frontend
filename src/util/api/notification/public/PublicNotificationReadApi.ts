import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');

export const getPublicKey = async (): Promise<string> => {
    try {
        const response = await apiClient.get<string>(`${BASE_URL}/public-key`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.publicKeyNotLoaded'));
            }
        }
        throw error;
    }
};