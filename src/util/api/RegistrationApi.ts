import axios from 'axios';
import { TeamReturnDTO, TeamInputDTO, CharacterReturnDTO } from './config/dto';
import { API_BASE_URL } from './config/constants';

export const getTeams = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await axios.get<TeamReturnDTO[]>(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
};

export const getTeamsSortedByNormalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await axios.get<TeamReturnDTO[]>(`${API_BASE_URL}/sortedByNormalPoints`);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams sorted by normal points:', error);
        throw error;
    }
};

export const getTeamsSortedByFinalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await axios.get<TeamReturnDTO[]>(`${API_BASE_URL}/sortedByFinalPoints`);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams sorted by final points:', error);
        throw error;
    }
};

export const getTeamById = async (id: number): Promise<TeamReturnDTO> => {
    try {
        const response = await axios.get<TeamReturnDTO>(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching team by ID:', error);
        throw error;
    }
};

export const getTeamByName = async (name: string): Promise<TeamReturnDTO> => {
    try {
        const response = await axios.get<TeamReturnDTO>(`${API_BASE_URL}/name/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching team by name:', error);
        throw error;
    }
};

export const getCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await axios.get<CharacterReturnDTO[]>(`${API_BASE_URL}/characters`);
        return response.data;
    } catch (error) {
        console.error('Error fetching characters:', error);
        throw error;
    }
};

export const getAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await axios.get<CharacterReturnDTO[]>(`${API_BASE_URL}/characters/available`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available characters:', error);
        throw error;
    }
};

export const getTakenCharacters = async (): Promise<CharacterReturnDTO[]> => {
    try {
        const response = await axios.get<CharacterReturnDTO[]>(`${API_BASE_URL}/characters/taken`);
        return response.data;
    } catch (error) {
        console.error('Error fetching taken characters:', error);
        throw error;
    }
};

export const getCharacterById = async (id: number): Promise<CharacterReturnDTO> => {
    try {
        const response = await axios.get<CharacterReturnDTO>(`${API_BASE_URL}/characters/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching character by ID:', error);
        throw error;
    }
};

export const getCharacterByName = async (name: string): Promise<CharacterReturnDTO> => {
    try {
        const response = await axios.get<CharacterReturnDTO>(`${API_BASE_URL}/characters/name/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching character by name:', error);
        throw error;
    }
};

export const addTeam = async (team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await axios.post<TeamReturnDTO>(API_BASE_URL, team);
        return response.data;
    } catch (error) {
        console.error('Error adding team:', error);
        throw error;
    }
};

export const updateTeam = async (id: number, team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await axios.put<TeamReturnDTO>(`${API_BASE_URL}/${id}`, team);
        return response.data;
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
};
