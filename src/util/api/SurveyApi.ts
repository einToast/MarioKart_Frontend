import {API_BASE_URL} from "./config/constants";
import {AnswerInputDTO, AnswerReturnDTO, QuestionInputDTO, QuestionReturnDTO} from "./config/dto";
import apiClient from "./config/apiClient";
import axios from "axios";

const BASE_URL = `${API_BASE_URL}/survey`;

export const getQuestions = async (): Promise<QuestionReturnDTO[]> => {
    try{
        const response = await apiClient.get<QuestionReturnDTO[]>(`${BASE_URL}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Fragen konnten nicht geladen werden');
            }
        }
        throw error;
    }
}

export const getVisibleQuestions = async (): Promise<QuestionReturnDTO[]> => {
    try {
        const response = await apiClient.get<QuestionReturnDTO[]>(`${BASE_URL}/visible`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Fragen konnten nicht geladen werden');
            }
        }
        throw error;
    }
}

export const getQuestion = async (questionId: number): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.get<QuestionReturnDTO>(`${BASE_URL}/${questionId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404){
                throw new Error('Frage konnte nicht gefunden werden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht geladen werden');
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
            if (error.response?.status === 404){
                throw new Error('Frage konnte nicht gefunden werden');
            } else if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht geladen werden');
            }
        }
        throw error;
    }
}

export const createQuestion = async (question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.post<QuestionReturnDTO>(`${BASE_URL}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400){
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
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Antwort konnte nicht übermittelt werden');
            }
        }
        throw error;
    }
}

export const deleteQuestion = async (questionId: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${questionId}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401){
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht gelöscht werden');
            }
        }
        throw error;
    }
}

export const updateQuestion = async (questionId: number, question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.put<QuestionReturnDTO>(`${BASE_URL}/${questionId}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
}