import axios from "axios";
import apiClient from "../config/apiClient";
import { API_BASE_URL } from "../config/constants";

const BASE_URL = `${API_BASE_URL}/survey`;

export const deleteQuestions = async (): Promise<void> => {
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