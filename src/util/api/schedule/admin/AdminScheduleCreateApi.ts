import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from '../../config/constants';
import { BreakInputDTO, BreakReturnDTO, RoundReturnDTO } from '../../config/dto';

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
            }
            throw new Error('Spielplan konnte nicht erstellt werden');
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
            }
            throw new Error('Finalrunden konnten nicht erstellt werden');
        }
        throw error;
    }
};

export const addBreak = async (breakData: BreakInputDTO): Promise<BreakReturnDTO> => {
    try {
        const response = await apiClient.post<BreakReturnDTO>(`${BASE_URL}/break`, breakData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Pause konnte nicht erstellt werden');
        }
        throw error;
    }
};