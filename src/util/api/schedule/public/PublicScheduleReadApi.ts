import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { RoundReturnDTO, ScheduleOverviewDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SCHEDULE');

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds/current`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.currentRoundsNotLoaded'));
        }
        throw error;
    }
};

export const getOverview = async (): Promise<ScheduleOverviewDTO> => {
    try {
        const response = await apiClient.get<ScheduleOverviewDTO>(`${BASE_URL}/overview`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.scheduleNotLoaded'));
        }
        throw error;
    }
};

export const getNumberOfRoundsUnplayed = async (): Promise<number> => {
    try {
        const response = await apiClient.get<number>(`${BASE_URL}/rounds/unplayed`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.unplayedRoundsNotLoaded'));
        }
        throw error;
    }
};

export const isScheduleCreated = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<boolean>(`${BASE_URL}/create/schedule`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.scheduleStatusNotLoaded'));
        }
        throw error;
    }
};

export const isFinalScheduleCreated = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<boolean>(`${BASE_URL}/create/final_schedule`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.finalStatusNotLoaded'));
        }
        throw error;
    }
};