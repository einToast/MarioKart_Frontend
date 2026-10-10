import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TournamentDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('ADMIN', 'SETTINGS');

export const updateSettings = async (updateSettings: TournamentDTO): Promise<TournamentDTO> => {
    try {
        const response = await apiClient.put<TournamentDTO>(BASE_URL, updateSettings);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Spielplan wurde bereits erstellt');
            } else if (error.response?.status === 404) {
                throw new Error('Einstellungen nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Einstellungen konnten nicht aktualisiert werden');
            }
        }
        throw error;
    }
}