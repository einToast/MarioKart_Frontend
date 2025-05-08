import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { RoundReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const createMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/match_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Spielplan existiert bereits');
            } else if (error.response?.status === 404) {
                throw new Error('Nicht genügend Teams vorhanden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status ===  500) {
                throw new Error('Benachrichtigung konnte nicht gesendet werden');
            } else {
                throw new Error('Spielplan konnte nicht erstellt werden');
            }
        }
        throw error;
    }
};

export const createFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/final_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Finalrunden existieren bereits');
            } else if (error.response?.status === 404) {
                throw new Error('Nicht genügend Teams vorhanden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Noch nicht alle Runden gespielt');
            } else if (error.response?.status === 500) {
                throw new Error('Benachrichtigung konnte nicht gesendet werden');
            } else {
                throw new Error('Finalrunden konnten nicht erstellt werden');
            }
        }
        throw error;
    }
};