import { AdminSurveyApi } from "../../../api";
import { QuestionReturnDTO } from "../../../api/config/dto";

export const deleteQuestion = async (question: QuestionReturnDTO): Promise<void> => {
    return await AdminSurveyApi.deleteQuestion(question.id);
}

export const deleteAllQuestions = async (): Promise<void> => {
    const questions = await AdminSurveyApi.getQuestions();
    await Promise.all(questions.map(question => AdminSurveyApi.deleteQuestion(question.id)));
}