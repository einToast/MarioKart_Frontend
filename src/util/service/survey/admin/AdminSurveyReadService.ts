import { AdminSurveyApi } from "../../../api";
import { AnswerReturnDTO, QuestionReturnDTO } from "../../../api/config/dto";

export const getQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return AdminSurveyApi.getQuestions();
}

export const getAnswersOfQuestion = async (questionId: number): Promise<AnswerReturnDTO[]> => {
    return AdminSurveyApi.getAnswersOfQuestion(questionId);
}

export const getStatisticsOfQuestion = async (questionId: number): Promise<number[]> => {
    if (questionId === -1) {
        return [];
    }
    return AdminSurveyApi.getStatisticsOfQuestion(questionId);
}

export const getNumberOfAnswers = async (questionId: number): Promise<number> => {
    if (questionId === -1) {
        return 0;
    }
    return AdminSurveyApi.getNumberOfAnswers(questionId);
}