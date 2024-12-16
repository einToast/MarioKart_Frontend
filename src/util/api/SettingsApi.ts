import axios from 'axios';

import { API_BASE_URL } from './config/constants';
import apiClient from "./config/apiClient";
import {TournamentDTO} from "./config/dto";

const BASE_URL = `${API_BASE_URL}/settings`;

export const getSettings = async (): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.get<TournamentDTO>(BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404){
                throw new Error('Einstellungen nicht gefunden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Einstellungen konnten nicht geladen werden');
            }
        }
        throw error;
    }
};

export const updateSettings = async (updateSettings: TournamentDTO): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.put<TournamentDTO>(BASE_URL, updateSettings);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409){
                throw new Error('Matchplan wurde bereits erstellt');
            }
            if (error.response?.status === 404){
                throw new Error('Einstellungen nicht gefunden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Einstellungen konnten nicht aktualisiert werden');
            }
        }
        throw error;
    }
}

export const reset = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/reset`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Daten konnten nicht zurückgesetzt werden');
            }
        }
        throw error;
    }
}