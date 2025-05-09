import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { CharacterReturnDTO, TeamReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'REGISTRATION');

export const getTeams = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Teams konnten nicht geladen werden');
        }
        throw error;
    }
};

export const getTeamsSortedByGroupPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByGroupPoints`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Teams konnten nicht geladen werden');
        }
        throw error;
    }
};

export const getTeamsSortedByTeamName = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByTeamName`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Teams konnten nicht geladen werden');
        }
        throw error;
    }
};

export const getAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await apiClient.get<CharacterReturnDTO[]>(`${BASE_URL}/characters/available`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Charaktere konnten nicht geladen werden');
        }
        throw error;
    }
};

export const getTeamsNotInRound = async (roundId: number): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/notInRound/${roundId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Teams konnten nicht geladen werden');
        }
        throw error;
    }
};