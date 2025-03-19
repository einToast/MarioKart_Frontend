import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from '../../config/constants';
import { BreakInputDTO, BreakReturnDTO, PointsInputDTO, PointsReturnDTO, RoundInputDTO, RoundReturnDTO } from '../../config/dto';

const BASE_URL = `${API_BASE_URL}${ApiPath.createPath('ADMIN', 'SCHEDULE')}`;

export const updateRoundPlayed = async (roundId: number, round: RoundInputDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`, round);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Runde nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Runde konnte nicht aktualisiert werden');
        }
        throw error;
    }
};

export const updatePoints = async (
    roundId: number,
    gameId: number,
    teamId: number,
    points: PointsInputDTO
): Promise<PointsReturnDTO> => {
    try {
        const response = await apiClient.put<PointsReturnDTO>(
            `${BASE_URL}/rounds/${roundId}/games/${gameId}/teams/${teamId}/points`,
            points
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Eintrag nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Punkte konnten nicht aktualisiert werden');
        }
        throw error;
    }
};

export const updateBreak = async (breakData: BreakInputDTO): Promise<BreakReturnDTO> => {
    try {
        const response = await apiClient.put<BreakReturnDTO>(`${BASE_URL}/break`, breakData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Pause nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Pause konnte nicht aktualisiert werden');
        }
        throw error;
    }
};