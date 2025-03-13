import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import { RoundReturnDTO } from '../config/dto';

const BASE_URL = `${API_BASE_URL}/match_plan`;

export const createMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/match_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Matchplan konnte nicht erstellt werden');
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
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Finale konnte nicht erstellt werden');
            }
        }
        throw error;
    }
};