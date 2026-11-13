import { AdminSurveyApi } from "../../../api";
import { QuestionReturnDTO } from "../../../api/config/dto";

export const deleteQuestion = async (question: QuestionReturnDTO): Promise<void> => {
    return await AdminSurveyApi.deleteQuestion(question.id);
}

export const deleteAllQuestions = async (): Promise<void> => {
    return await AdminSurveyApi.deleteAllQuestions();
}