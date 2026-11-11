import axios from "axios";
import apiClient, { ApiPath } from "../../config/apiClient";
import { AnswerInputDTO, AnswerReturnDTO } from "../../config/dto";
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'SURVEY');

const answerErrorMessage = (status: number | undefined, details: string): string => {
    switch (status) {
        case 429:
            return details.includes("survey key") ? i18n.t('errors.alreadyAnswered') : i18n.t('errors.tooManyAnswers');
        case 403:
            return i18n.t('errors.surveyKeyRequired');
        case 409:
            return i18n.t('errors.questionNotAnswerable');
        case 404:
            return i18n.t('errors.questionNotFound');
        case 400:
            return details.includes("Invalid answer") ? i18n.t('errors.invalidAnswer') : i18n.t('errors.notAuthenticated');
        default:
            return i18n.t('errors.answerNotSubmitted');
    }
}

export const submitAnswer = async (answer: AnswerInputDTO): Promise<AnswerReturnDTO> => {
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