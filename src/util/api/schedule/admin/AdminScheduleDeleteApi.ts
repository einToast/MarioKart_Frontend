import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const deleteSchedule = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/schedule`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.scheduleNotDeleted'));
            }
        }
        throw error;
    }
};

export const deleteFinalSchedule = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/final_schedule`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.finalNotDeleted'));
            }
        }
        throw error;
    }
};