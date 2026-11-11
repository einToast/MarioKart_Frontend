import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { QuestionInputDTO, QuestionReturnDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const updateQuestion = async (questionId: number, question: QuestionInputDTO): Promise<QuestionReturnDTO> => {
    try {
        const response = await apiClient.put<QuestionReturnDTO>(`${BASE_URL}/${questionId}`, question);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {

            if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.questionNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.questionTypeUnsupported'));
            } else if (error.response?.status === 500) {
                throw new Error(i18n.t('errors.notificationNotSent'));
            } else {
                throw new Error(i18n.t('errors.questionNotUpdated'));
            }
        }
        throw error;
    }
}