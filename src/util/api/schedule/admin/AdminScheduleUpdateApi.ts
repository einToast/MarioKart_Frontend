import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { BreakInputDTO, BreakReturnDTO, GameInputFullDTO, GameReturnDTO, PointsInputDTO, PointsReturnDTO, RoundInputDTO, RoundInputFullDTO, RoundReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const updateRoundPlayed = async (roundId: number, round: RoundInputDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`, round);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Pause wurde noch nicht beendet');
            } else if (error.response?.status === 404) {
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
            } else {
                throw new Error('Punkte konnten nicht aktualisiert werden');
            }
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
            } else {
                throw new Error('Pause konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};

export const updateRoundFull = async (roundId: number, round: RoundInputFullDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}/full`, round);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Runde nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 500) {
                throw new Error('Serverfehler beim Speichern der Runde');
            } else {
                throw new Error('Runde konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};

export const updateGame = async (gameId: number, game: GameInputFullDTO): Promise<GameReturnDTO> => {
    try {
        const response = await apiClient.put<GameReturnDTO>(`${BASE_URL}/games/${gameId}`, game);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Spiel nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spiel konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};
