import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'REGISTRATION');
//TODO: update error messages
export const getTeamsSortedByFinalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByFinalPoints`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Teams konnten nicht abgerufen werden');
            }
        }
        throw error;
    }
};

export const getFinalTeams = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/finalTeams`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Team konnte nicht abgerufen werden');
            }
        }
        throw error;
    }
};