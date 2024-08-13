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
        console.error('Error fetching rounds:', error);
        throw error;
    }
};

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds/current`);
        return response.data;
    } catch (error) {
        console.error('Error fetching current rounds:', error);
        throw error;
    }
};

export const getRoundById = async (roundId: number): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.get<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching round by ID:', error);
        throw error;
    }
};

export const getGamesByRoundId = async (roundId: number): Promise<GameReturnDTO[]> => {
    try {
        const response = await apiClient.get<GameReturnDTO[]>(`${BASE_URL}/rounds/${roundId}/games`);
        return response.data;
    } catch (error) {
        console.error('Error fetching games by round ID:', error);
        throw error;
    }
};

export const getGames = async (): Promise<GameReturnDTO[]> => {
    try {
        const response = await apiClient.get<GameReturnDTO[]>(`${BASE_URL}/games`);
        return response.data;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
};

export const getGameById = async (gameId: number): Promise<GameReturnDTO> => {
    try {
        const response = await apiClient.get<GameReturnDTO>(`${BASE_URL}/games/${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching game by ID:', error);
        throw error;
    }
};

export const getPoints = async (): Promise<PointsReturnDTO[]> => {
    try {
        const response = await apiClient.get<PointsReturnDTO[]>(`${BASE_URL}/points`);
        return response.data;
    } catch (error) {
        console.error('Error fetching points:', error);
        throw error;
    }
};

export const createMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/match_plan`);
        return response.data;
    } catch (error) {
        console.error('Error creating match plan:', error);
        throw error;
    }
}

export const createFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.post<RoundReturnDTO[]>(`${BASE_URL}/create/final_plan`);
        return response.data;
    } catch (error) {
        console.error('Error creating final plan:', error);
        throw error;
    }
}

export const updateRoundPlayed = async (roundId: number,round: RoundInputDTO): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.put<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`, round);
        return response.data;
    } catch (error) {
        console.error('Error updating round played:', error);
        throw error;
    }
}

export const updatePoints = async (roundId: number, gameId:number, teamId:number, points: PointsInputDTO): Promise<PointsReturnDTO> => {
    try {
        const response = await apiClient.put<PointsReturnDTO>(`${BASE_URL}/rounds/${roundId}/games/${gameId}/teams/${teamId}/points`, points);
        return response.data;
    } catch (error) {
        console.error('Error updating points:', error);
        throw error;
    }
}