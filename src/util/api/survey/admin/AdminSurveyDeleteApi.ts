import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const deleteQuestion = async (questionId: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${questionId}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
}

export const deleteAllQuestions = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Fragen konnten nicht gelöscht werden');
            }
        }
        throw error;
    }
}