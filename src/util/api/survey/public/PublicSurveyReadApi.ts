import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { QuestionReturnDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SURVEY');

export const getVisibleQuestions = async (): Promise<QuestionReturnDTO[]> => {
    try {
        const response = await apiClient.get<QuestionReturnDTO[]>(`${BASE_URL}/visible`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Fragen konnten nicht geladen werden');
            }
        }
        throw error;
    }
}

export const getStatisticsOfQuestion = async (questionId: number): Promise<number[]> => {
    try {
        const response = await apiClient.get<number[]>(`${BASE_URL}/${questionId}/statistics`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Frage nicht ausgewertet');
            } else if (error.response?.status === 404) {
                throw new Error('Frage konnte nicht gefunden werden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Frage ist nicht auswertbar');
            } else {
                throw new Error('Frage konnte nicht geladen werden');
            }
        }
        throw error;
    }
}