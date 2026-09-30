import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { AnswerInputDTO, AnswerReturnDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SURVEY');

export const submitAnswer = async (answer: AnswerInputDTO, teamId: number): Promise<AnswerReturnDTO> => {
    try {
        const response = await apiClient.post(`${BASE_URL}/answer`, answer);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                if (String(error.response.data).includes("survey key")) {
                    throw new Error("Du hast diese Frage bereits beantwortet");
                }
                throw new Error("Dein Team hat zu oft geantwortet");
            } else if (error.response?.status === 403) {
                throw new Error("Die Teilnahme ist nur noch für Geräte möglich, die bereits an einer Umfrage teilgenommen haben");
            } else if (error.response?.status === 409) {
                throw new Error("Frage kann nicht beantwortet werden");
            } else if (error.response?.status === 404) {
                throw new Error("Frage nicht gefunden");
            } else if (error.response?.status === 400) {
                throw new Error("Du bist nicht authentifiziert, bitte melde dich erneut an");
            } else {
                throw new Error("Antwort konnte nicht übermittelt werden");
            }
        }
        throw error;
    }
}