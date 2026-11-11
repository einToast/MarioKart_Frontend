import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { QuestionReturnDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SURVEY');

export const getVisibleQuestions = async (): Promise<QuestionReturnDTO[]> => {
    try {
        const response = await apiClient.get<QuestionReturnDTO[]>(`${BASE_URL}/visible`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(i18n.t('errors.questionsNotLoaded'));
        }
        throw error;
    }
}

export const getStatisticsOfQuestion = async (questionId: number): Promise<number[]> => {
    try {
        const response = await apiClient.get<number[]>(`${BASE_URL}/${questionId}/statistics`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.questionNotEvaluated'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.questionNotFoundAlt'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.questionNotEvaluable'));
            } else {
                throw new Error(i18n.t('errors.questionNotLoaded'));
            }
        }
        throw error;
    }
}