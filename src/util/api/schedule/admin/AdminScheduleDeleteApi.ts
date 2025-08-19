import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const deleteSchedule = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/schedule`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spielplan konnte nicht gelöscht werden');
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
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Finalrunden konnten nicht gelöscht werden');
            }
        }
        throw error;
    }
};