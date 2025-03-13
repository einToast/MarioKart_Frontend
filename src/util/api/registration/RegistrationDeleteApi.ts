import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';

const BASE_URL = `${API_BASE_URL}/teams`;

export const deleteAllTeams = async (): Promise<void> => {
    try {
        await apiClient.delete(BASE_URL);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 401) {
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
            if (error.response?.status === 409) {
                throw new Error('Matchplan wurde bereits erstellt');
            } else if (error.response?.status === 404) {
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