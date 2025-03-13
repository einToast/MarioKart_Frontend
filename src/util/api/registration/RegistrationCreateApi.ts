import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import { TeamInputDTO, TeamReturnDTO } from '../config/dto';

const BASE_URL = `${API_BASE_URL}/teams`;

export const addTeam = async (team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.post<TeamReturnDTO>(BASE_URL, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Registrierung ist nicht möglich');
            } else if (error.response?.status === 404) {
                throw new Error('Charakter nicht gefunden');
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