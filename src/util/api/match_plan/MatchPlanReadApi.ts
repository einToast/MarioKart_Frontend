import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import {
    BreakReturnDTO,
    GameReturnDTO,
    PointsReturnDTO,
    RoundReturnDTO
} from '../config/dto';

const BASE_URL = `${API_BASE_URL}/match_plan`;

export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Runden konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds/current`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Runden konnten nicht geladen werden');
            }
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
                throw new Error('Runde konnte nicht gefunden werden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Runde konnte nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getGamesByRoundId = async (roundId: number): Promise<GameReturnDTO[]> => {
    try {
        const response = await apiClient.get<GameReturnDTO[]>(`${BASE_URL}/rounds/${roundId}/games`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spiele konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getGames = async (): Promise<GameReturnDTO[]> => {
    try {
        const response = await apiClient.get<GameReturnDTO[]>(`${BASE_URL}/games`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spiele konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getGameById = async (gameId: number): Promise<GameReturnDTO> => {
    try {
        const response = await apiClient.get<GameReturnDTO>(`${BASE_URL}/games/${gameId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spiel konnte nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getPoints = async (): Promise<PointsReturnDTO[]> => {
    try {
        const response = await apiClient.get<PointsReturnDTO[]>(`${BASE_URL}/points`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Punkte konnten nicht geladen werden');
            }
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
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Pausen konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const checkMatchPlan = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<boolean>(`${BASE_URL}/create/match_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spielplan konnte nicht überprüft werden');
            }
        }
        throw error;
    }
};

export const checkFinalPlan = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<boolean>(`${BASE_URL}/create/final_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Finale konnte nicht überprüft werden');
            }
        }
        throw error;
    }
};