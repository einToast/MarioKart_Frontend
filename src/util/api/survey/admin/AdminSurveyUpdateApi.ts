import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { QuestionInputDTO, QuestionReturnDTO } from "../../config/dto";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const updateQuestion = async (questionId: number, question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.put<QuestionReturnDTO>(`${BASE_URL}/${questionId}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Frage nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Fragentyp wird nicht unterstützt');
            } else {
                throw new Error('Frage konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
}