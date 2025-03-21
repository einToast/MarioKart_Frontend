import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'REGISTRATION');
//TODO: update error messages
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

export const getTeamsSortedByFinalPoints = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.get<TeamReturnDTO[]>(`${BASE_URL}/sortedByFinalPoints`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error('Teams konnten nicht geladen werden');
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
            throw new Error('Teams konnten nicht geladen werden');
        }
        throw error;
    }
};