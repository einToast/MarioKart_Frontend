import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { RoundReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'SCHEDULE');

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds/current`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Aktuelle Runden konnten nicht geladen werden');
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
            throw new Error('Anzahl der ungespielten Runden konnte nicht geladen werden');
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
            throw new Error('Spielplan-Status konnte nicht geladen werden');
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
            throw new Error('Finalrunden-Status konnte nicht geladen werden');
        }
        throw error;
    }
};