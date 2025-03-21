import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'REGISTRATION');

export const deleteTeam = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Team konnte nicht gelöscht werden');
        }
        throw error;
    }
};

export const deleteAllTeams = async (): Promise<void> => {
    try {
        await apiClient.delete(BASE_URL);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            }
            throw new Error('Teams konnten nicht gelöscht werden');
        }
        throw error;
    }
};