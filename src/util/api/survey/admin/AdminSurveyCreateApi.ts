import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { API_BASE_URL } from "../../config/constants";
import { QuestionInputDTO, QuestionReturnDTO } from "../../config/dto";

const BASE_URL = `${API_BASE_URL}${ApiPath.createPath('ADMIN', 'SURVEY')}`;

export const createQuestion = async (question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.post<QuestionReturnDTO>(`${BASE_URL}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Frage konnte nicht erstellt werden');
            }
        }
        throw error;
    }
}