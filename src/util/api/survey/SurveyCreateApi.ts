import axios from "axios";
import apiClient from "../config/apiClient";
import { API_BASE_URL } from "../config/constants";
import { AnswerInputDTO, AnswerReturnDTO, QuestionInputDTO, QuestionReturnDTO } from "../config/dto";

const BASE_URL = `${API_BASE_URL}/survey`;

export const createQuestion = async (question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.post<QuestionReturnDTO>(`${BASE_URL}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Frage konnte nicht erstellt werden');
            } else {
                throw new Error('Frage konnte nicht erstellt werden');
            }
        }
        throw error;
    }
}

export const submitAnswer = async (answer: AnswerInputDTO): Promise<AnswerReturnDTO> => {
    try {
        const response = await apiClient.post(`${BASE_URL}/answer`, answer);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Frage kann nicht beantwortet werden');
            } else if (error.response?.status === 404) {
                throw new Error('Frage nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Antwort konnte nicht übermittelt werden');
            }
        }
        throw error;
    }
}