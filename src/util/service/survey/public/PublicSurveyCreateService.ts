import Cookies from "js-cookie";
import { PublicSurveyApi } from "../../../api";
import { AnswerCookieDTO, AnswerInputDTO, AnswerReturnDTO, QuestionReturnDTO } from "../../../api/config/dto";
import { QuestionType } from "../../util";

export const submitAnswer = async (question: QuestionReturnDTO, vote: string | number | number[], teamId: number): Promise<AnswerReturnDTO> => {
    if (!question.active) {
        throw new Error('Die Umfrage ist bereits beendet');
    } else if (vote === '') {
        throw new Error('Die Antwort darf nicht leer sein');
    } else if (
        (typeof vote === 'number' && vote === -1) ||
        (Array.isArray(vote) && (vote.length === 0 || vote.some(v => v === -1)))
    ) {
        throw new Error('Es wurde keine Antwort ausgewählt');
    }

    const answer: AnswerInputDTO = {
        questionId: question.id,
        answerType: question.questionType,
        freeTextAnswer: question.questionType === QuestionType.FREE_TEXT ? String(vote) : '',
        multipleChoiceSelectedOption: question.questionType === QuestionType.MULTIPLE_CHOICE ? Number(vote) : -1,
        checkboxSelectedOptions: question.questionType === QuestionType.CHECKBOX ? (Array.isArray(vote) ? vote.map(Number) : []) : [],
        teamSelectedOption: question.questionType === QuestionType.TEAM ? Number(vote) : -1
    }

    const response = await PublicSurveyApi.submitAnswer(answer, teamId);
    await setAnswerCookie(question.questionText + question.id, typeof vote === 'number' ? vote : Number(Array.isArray(vote) ? vote[0] : vote));
    return response;
}

export const setAnswerCookie = async (questionString: string, answer: number): Promise<void> => {
    const answerCookie: AnswerCookieDTO = {
        answerId: answer.toString(),
    }
    Cookies.set(questionString, JSON.stringify(answerCookie), { expires: 1, sameSite: 'strict' });
}