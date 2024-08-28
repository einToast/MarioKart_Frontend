import axios from 'axios';
import {RoundReturnDTO, GameReturnDTO, PointsReturnDTO, RoundInputDTO, PointsInputDTO} from './config/dto';
import { API_BASE_URL } from './config/constants';
import apiClient from "./config/apiClient";

const BASE_URL = `${API_BASE_URL}/match_plan`;

export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
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
            if (error.response?.status === 401){
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
            if (error.response?.status === 404){
                throw new Error('Runde konnte nicht gefunden werden');
            } else if (error.response?.status === 401){
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
            if (error.response?.status === 401){
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
            if (error.response?.status === 401){
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
            if (error.response?.status === 404){
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 401){
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
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Punkte konnten nicht geladen werden');
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
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spielplan konnte nicht überprüft werden');
            }
        }
        throw error;
    }
}

export const checkFinalPlan = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<boolean>(`${BASE_URL}/create/final_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Finale konnte nicht überprüft werden');
            }
        }
        throw error;
    }
}

export const createMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/match_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409){
                throw new Error('Spielplan existiert bereits');
            } else if (error.response?.status === 404){
                throw new Error('Nicht genügend Teams vorhanden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spielplan konnte nicht erstellt werden');
            }
        }
        throw error;
    }
}

export const createFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/final_plan`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409){
                throw new Error('Finale existiert bereits');
            } else if (error.response?.status === 404){
                throw new Error('Nicht genügend Teams vorhanden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Nicht alle Runden gespielt');
            } else {
                throw new Error('Finale konnte nicht erstellt werden');
            }
        }
        throw error;
    }
}

export const updateRoundPlayed = async (roundId: number,round: RoundInputDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`, round);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404){
                throw new Error('Runde konnte nicht gefunden werden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Runde konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
}

export const updatePoints = async (roundId: number, gameId:number, teamId:number, points: PointsInputDTO): Promise<PointsReturnDTO> => {
    try {
        const response = await apiClient.put<PointsReturnDTO>(`${BASE_URL}/rounds/${roundId}/games/${gameId}/teams/${teamId}/points`, points);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404){
                throw new Error('Punkte konnten nicht gefunden werden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Punkte konnten nicht aktualisiert werden');
            }
        }
        throw error;
    }
}

export const deleteMatchPlan = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/match_plan`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Spielplan konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
}

export const deleteFinalPlan = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/create/final_plan`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Finale konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
}

export const reset = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/reset`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Daten konnten nicht zurückgesetzt werden');
            }
        }
        throw error;
    }
}