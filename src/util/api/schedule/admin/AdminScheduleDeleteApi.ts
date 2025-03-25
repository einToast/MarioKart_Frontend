import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const deleteMatchPlan = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/match_plan`);
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

export const deleteFinalPlan = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/final_plan`);
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