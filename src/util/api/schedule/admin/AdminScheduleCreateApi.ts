import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { RoundReturnDTO, ScheduleInputDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const createSchedule = async (scheduleInput: ScheduleInputDTO): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/schedule`, scheduleInput);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.scheduleExists'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.notEnoughTeamsForSchedule'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.invalidScheduleParameters'));
            } else if (error.response?.status ===  500) {
                throw new Error(i18n.t('errors.notificationNotSent'));
            } else {
                throw new Error(i18n.t('errors.scheduleNotCreated'));
            }
        }
        throw error;
    }
};

export const createFinalSchedule = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/final_schedule`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.finalExists'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.notEnoughTeams'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.roundsNotPlayed'));
            } else if (error.response?.status === 500) {
                throw new Error(i18n.t('errors.notificationNotSent'));
            } else {
                throw new Error(i18n.t('errors.finalNotCreated'));
            }
        }
        throw error;
    }
};