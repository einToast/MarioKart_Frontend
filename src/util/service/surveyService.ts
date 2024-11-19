import {getActiveQuestions} from "../api/SurveyApi";
import {QuestionReturnDTO} from "../api/config/dto";
import Cookies from "js-cookie";

export const getCurrentQuestions = async (): Promise<QuestionReturnDTO[]> => {
    const questions = getActiveQuestions();
    return questions;
}

export const setAnswers = async (answers: string[]): Promise<void> => {
    Cookies.set('answers', answers);
}