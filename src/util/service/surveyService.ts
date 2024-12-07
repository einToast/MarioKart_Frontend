import {getActiveQuestions, getAnswersOfQuestion, submitAnswer} from "../api/SurveyApi";
import {AnswerInputDTO, AnswerReturnDTO, QuestionReturnDTO} from "../api/config/dto";
import Cookies from "js-cookie";
import {QuestionType} from "./util";

export const getCurrentQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return getActiveQuestions();
}

export const getAnswers = async (questionId: number): Promise<AnswerReturnDTO[]> => {
    return getAnswersOfQuestion(questionId);
}


export const registerAnswer = async (question: QuestionReturnDTO, vote: any): Promise<AnswerReturnDTO> => {

    const freeTextAnswer = question.questionType === QuestionType.FREE_TEXT? vote : '';
    const multipleChoiceSelectedOption = question.questionType === QuestionType.MULTIPLE_CHOICE ? vote : -1;
    const checkboxSelectedOptions = question.questionType === QuestionType.CHECKBOX ? vote : [];

    const answer: AnswerInputDTO = {
        questionId: question.id,
        answerType: question.questionType,
        freeTextAnswer: freeTextAnswer,
        multipleChoiceSelectedOption: multipleChoiceSelectedOption,
        checkboxSelectedOptions: checkboxSelectedOptions
    }

    console.log(answer);

    const response = await submitAnswer(answer);

    await setAnswer(question.questionText + question.id, vote);

    return response;
}

export const setAnswer = async (questionString: string, answer: number): Promise<void> => {

    const answerCookie = {
        answerId: answer.toString(),
        // timestamp: new Date().getTime()
    }
    Cookies.set(questionString, JSON.stringify(answerCookie), {expires: 1,sameSite: 'strict'});
}

export const getAnswer = async (questionString: string): Promise<any> => {
    const answerCookie = Cookies.get(questionString);
    if (answerCookie) {
        return JSON.parse(answerCookie)
    }
    return -1;
}
