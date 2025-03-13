import axios from 'axios';
import apiClient from "../config/apiClient";
import { API_BASE_URL } from '../config/constants';
import { TournamentDTO } from "../config/dto";

const BASE_URL = `${API_BASE_URL}/settings`;

export const getSettings = async (): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.get<TournamentDTO>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Einstellungen nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Einstellungen konnten nicht geladen werden');
            }
        }
        throw error;
    }
};