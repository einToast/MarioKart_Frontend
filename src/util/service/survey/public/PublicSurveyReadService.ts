import Cookies from "js-cookie";
import { PublicSurveyApi } from "../../../api";
import { AnswerCookieDTO, QuestionReturnDTO } from "../../../api/config/dto";

export const getVisibleQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return PublicSurveyApi.getVisibleQuestions();
}

export const getStatisticsOfQuestion = async (questionId: number): Promise<number[]> => {
    return PublicSurveyApi.getStatisticsOfQuestion(questionId);
}

export const getAnswerCookie = async (questionString: string): Promise<AnswerCookieDTO | -1> => {
    const answerCookie = Cookies.get(questionString);
    if (answerCookie) {
        return JSON.parse(answerCookie) as AnswerCookieDTO;
    }
    return -1;
}