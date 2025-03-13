import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import {
    BreakInputDTO, BreakReturnDTO,
    PointsInputDTO, PointsReturnDTO,
    RoundInputDTO, RoundReturnDTO
} from '../config/dto';

const BASE_URL = `${API_BASE_URL}/match_plan`;

export const updateRoundPlayed = async (roundId: number, round: RoundInputDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`, round);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Pause wurde noch nicht beendet');
            } else if (error.response?.status === 404) {
                throw new Error('Runde konnte nicht gefunden werden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Runde konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};

export const updatePoints = async (roundId: number, gameId: number, teamId: number, points: PointsInputDTO): Promise<PointsReturnDTO> => {
    try {
        const response = await apiClient.put<PointsReturnDTO>(`${BASE_URL}/rounds/${roundId}/games/${gameId}/teams/${teamId}/points`, points);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Punkte konnten nicht gefunden werden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Punkte konnten nicht aktualisiert werden');
            }
        }
        throw error;
    }
};

export const updateBreak = async (aBreak: BreakInputDTO): Promise<BreakReturnDTO> => {
    try {
        const response = await apiClient.put<BreakReturnDTO>(`${BASE_URL}/break`, aBreak);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Pause konnte nicht gefunden werden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Pause konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};