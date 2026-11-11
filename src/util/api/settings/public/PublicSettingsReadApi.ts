import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TournamentDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SETTINGS');

export const getSettings = async (): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.get<TournamentDTO>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.settingsNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.settingsNotLoaded'));
            }
        }
        throw error;
    }
};