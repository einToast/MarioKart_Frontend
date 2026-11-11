import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TournamentDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SETTINGS');

export const updateSettings = async (updateSettings: TournamentDTO): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.put<TournamentDTO>(BASE_URL, updateSettings);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.scheduleAlreadyCreated'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.invalidSettings'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.settingsNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.settingsNotUpdated'));
            }
        }
        throw error;
    }
}