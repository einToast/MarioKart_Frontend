import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { AnswerInputDTO, AnswerReturnDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SURVEY');

const answerErrorMessage = (status: number | undefined, details: string): string => {
    switch (status) {
        case 429:
            return details.includes("survey key") ? "Du hast diese Frage bereits beantwortet" : "Dein Team hat zu oft geantwortet";
        case 403:
            return "Die Teilnahme ist nur noch für Geräte möglich, die bereits an einer Umfrage teilgenommen haben";
        case 409:
            return "Frage kann nicht beantwortet werden";
        case 404:
            return "Frage nicht gefunden";
        case 400:
            return details.includes("Invalid answer") ? "Die Antwort ist ungültig" : "Du bist nicht authentifiziert, bitte melde dich erneut an";
        default:
            return "Antwort konnte nicht übermittelt werden";
    }
}

export const submitAnswer = async (answer: AnswerInputDTO, teamId: number): Promise<AnswerReturnDTO> => {
    try {
        const response = await apiClient.post(`${BASE_URL}/answer`, answer);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(answerErrorMessage(error.response?.status, String(error.response?.data)));
        }
        throw error;
    }
}