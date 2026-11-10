import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'REGISTRATION');

export const deleteTeam = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.scheduleAlreadyCreated'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.teamNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.teamNotDeleted'));
            }
        }
        throw error;
    }
};

export const deleteAllTeams = async (): Promise<void> => {
    try {
        await apiClient.delete(BASE_URL);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.scheduleAlreadyCreated'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.teamsNotDeleted'));
            }
        }
        throw error;
    }
};