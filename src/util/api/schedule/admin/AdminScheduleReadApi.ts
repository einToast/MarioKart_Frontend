import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from '../../config/constants';
import { BreakReturnDTO, RoundReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Runden konnten nicht geladen werden');
        }
        throw error;
    }
};

export const getRoundById = async (roundId: number): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.get<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Runde nicht gefunden');
            }
            throw new Error('Runde konnte nicht geladen werden');
        }
        throw error;
    }
};

export const getBreak = async (): Promise<BreakReturnDTO> => {
    try {
        const response = await apiClient.get<BreakReturnDTO>(`${BASE_URL}/break`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Pause konnte nicht geladen werden');
        }
        throw error;
    }
};