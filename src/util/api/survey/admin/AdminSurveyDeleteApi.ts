import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SURVEY');

export const deleteQuestion = async (questionId: number): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}/${questionId}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.questionNotDeleted'));
            }
        }
        throw error;
    }
}

export const deleteAllQuestions = async (): Promise<void> => {
    try {
        await apiClient.delete(`${BASE_URL}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.questionsNotDeleted'));
            }
        }
        throw error;
    }
}