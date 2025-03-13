import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';

const BASE_URL = `${API_BASE_URL}/match_plan`;

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
                throw new Error('Finale konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
};