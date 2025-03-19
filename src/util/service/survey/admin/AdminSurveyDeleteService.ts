import { AdminSurveyApi } from "../../../api";
import { QuestionReturnDTO } from "../../../api/config/dto";

export const deleteQuestion = async (question: QuestionReturnDTO): Promise<void> => {
    return await AdminSurveyApi.deleteQuestion(question.id);
}

export const deleteAllQuestions = async (): Promise<void> => {
    const questions = await AdminSurveyApi.getQuestions();
    for (const question of questions) {
        await AdminSurveyApi.deleteQuestion(question.id);
    }
}