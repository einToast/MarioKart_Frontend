import axios from 'axios';
import { RoundReturnDTO, GameReturnDTO, PointsReturnDTO } from './config/dto';
import { API_BASE_URL } from './config/constants';

const BASE_URL = `${API_BASE_URL}/match_plan`;

export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await axios.get<RoundReturnDTO[]>(`${BASE_URL}/rounds`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rounds:', error);
        throw error;
    }
};

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await axios.get<RoundReturnDTO[]>(`${BASE_URL}/rounds/current`);
        return response.data;
    } catch (error) {
        console.error('Error fetching current rounds:', error);
        throw error;
    }
};

export const getRoundById = async (roundId: number): Promise<RoundReturnDTO> => {
    try {
        const response = await axios.get<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching round by ID:', error);
        throw error;
    }
};

export const getGamesByRoundId = async (roundId: number): Promise<GameReturnDTO[]> => {
    try {
        const response = await axios.get<GameReturnDTO[]>(`${BASE_URL}/rounds/${roundId}/games`);
        return response.data;
    } catch (error) {
        console.error('Error fetching games by round ID:', error);
        throw error;
    }
};

export const getGames = async (): Promise<GameReturnDTO[]> => {
    try {
        const response = await axios.get<GameReturnDTO[]>(`${BASE_URL}/games`);
        return response.data;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
};

export const getGameById = async (gameId: number): Promise<GameReturnDTO> => {
    try {
        const response = await axios.get<GameReturnDTO>(`${BASE_URL}/games/${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching game by ID:', error);
        throw error;
    }
};

export const getPoints = async (): Promise<PointsReturnDTO[]> => {
    try {
        const response = await axios.get<PointsReturnDTO[]>(`${BASE_URL}/points`);
        return response.data;
    } catch (error) {
        console.error('Error fetching points:', error);
        throw error;
    }
};
