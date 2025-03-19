import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { AnswerInputDTO, AnswerReturnDTO } from "../../config/dto";

const BASE_URL = `${API_BASE_URL}${ApiPath.createPath('PUBLIC', 'SURVEY')}`;

export const submitAnswer = async (answer: AnswerInputDTO, teamId: number): Promise<AnswerReturnDTO> => {
    try {
        const response = await apiClient.post(`${BASE_URL}/answer`, answer, {
            headers: {
                "X-Team-ID": teamId.toString(),
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                throw new Error("Dein Team hat zu oft geantwortet");
            } else if (error.response?.status === 409) {
                throw new Error("Frage kann nicht beantwortet werden");
            } else if (error.response?.status === 404) {
                throw new Error("Frage nicht gefunden");
            } else if (error.response?.status === 401) {
                throw new Error("Nicht autorisierter Zugriff");
            } else {
                throw new Error("Antwort konnte nicht übermittelt werden");
            }
        }
        throw error;
    }
}