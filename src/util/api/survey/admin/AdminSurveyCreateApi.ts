import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { QuestionInputDTO, QuestionReturnDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const createQuestion = async (question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.post<QuestionReturnDTO>(`${BASE_URL}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.questionNotCreated'));
            }
        }
        throw error;
    }
}