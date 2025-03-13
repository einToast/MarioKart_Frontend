import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import { CharacterReturnDTO, TeamReturnDTO } from '../config/dto';

const BASE_URL = `${API_BASE_URL}/teams`;

export const getTeams = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getTeamsSortedByNormalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByNormalPoints`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getTeamsSortedByFinalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByFinalPoints`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getTeamById = async (id: number): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.get<TeamReturnDTO>(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Team konnte nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getTeamByName = async (name: string): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.get<TeamReturnDTO>(`${BASE_URL}/name/${name}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Team konnte nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await apiClient.get<CharacterReturnDTO[]>(`${BASE_URL}/characters`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Charaktere konnten nicht geladen werden');
            }
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
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Charaktere konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getTakenCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await apiClient.get<CharacterReturnDTO[]>(`${BASE_URL}/characters/taken`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Charaktere konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getCharacterById = async (id: number): Promise<CharacterReturnDTO> => {
    try {
        const response = await apiClient.get<CharacterReturnDTO>(`${BASE_URL}/characters/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Charakter nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Charakter konnte nicht geladen werden');
            }
        }
        throw error;
    }
};

export const getCharacterByName = async (name: string): Promise<CharacterReturnDTO> => {
    try {
        const response = await apiClient.get<CharacterReturnDTO>(`${BASE_URL}/characters/name/${name}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Charakter konnte nicht geladen werden');
            }
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
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht geladen werden');
            }
        }
        throw error;
    }
};