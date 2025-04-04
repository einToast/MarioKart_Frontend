import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TournamentDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SETTINGS');

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