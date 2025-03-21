import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { AnswerReturnDTO, QuestionReturnDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const getQuestions = async (): Promise<QuestionReturnDTO[]> => {
    try {
        const response = await apiClient.get<QuestionReturnDTO[]>(`${BASE_URL}`);
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

export const getAnswersOfQuestion = async (questionId: number): Promise<AnswerReturnDTO[]> => {
    try {
        const response = await apiClient.get<AnswerReturnDTO[]>(`${BASE_URL}/${questionId}/answers`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
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

export const getStatisticsOfQuestion = async (questionId: number): Promise<number[]> => {
    try {
        const response = await apiClient.get<number[]>(`${BASE_URL}/${questionId}/statistics`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
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

export const getNumberOfAnswers = async (questionId: number): Promise<number> => {
    try {
        const response = await apiClient.get<number>(`${BASE_URL}/${questionId}/answers/count`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht geladen werden');
            }
        }
        throw error;
    }
}
