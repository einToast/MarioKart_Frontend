import axios from 'axios';
import apiClient from "./config/apiClient";
import { API_BASE_URL } from './config/constants';
import { CharacterReturnDTO, TeamInputDTO, TeamReturnDTO } from './config/dto';

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

export const addTeam = async (team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.post<TeamReturnDTO>(BASE_URL, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Token nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Token ist abgelaufen');
            } else if (error.response?.status === 400) {
                throw new Error('Charakter schon registriert');
            } else {
                throw new Error('Team konnte nicht erstellt werden');
            }
        }
        throw error;
    }
};

export const updateTeam = async (id: number, team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.put<TeamReturnDTO>(`${BASE_URL}/${id}`, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Fehlerhafte Anfrage');
            } else {
                throw new Error('Team konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};

export const deleteAllTeams = async (): Promise<void> => {
    try {
        await apiClient.delete(BASE_URL);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht gelöscht werden');
            }
        }
        throw error;
    }
}

export const deleteTeam = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Team konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
}