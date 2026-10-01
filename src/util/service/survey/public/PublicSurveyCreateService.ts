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
        (Array.isArray(vote) && (vote.length === 0 || vote.includes(-1)))
    ) {
        throw new Error('Es wurde keine Antwort ausgewählt');
    }

    const checkboxSelectedOptions = Array.isArray(vote) ? vote.map(Number) : [];

    const answer: AnswerInputDTO = {
        questionId: question.id,
        answerType: question.questionType,
        freeTextAnswer: (question.questionType === QuestionType.FREE_TEXT || question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) ? String(vote) : '',
        multipleChoiceSelectedOption: question.questionType === QuestionType.MULTIPLE_CHOICE ? Number(vote) : -1,
        checkboxSelectedOptions: question.questionType === QuestionType.CHECKBOX ? checkboxSelectedOptions : [],
        teamSelectedOption: question.questionType === QuestionType.TEAM ? Number(vote) : -1,
    }

    if (question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) {
        answer.teamSelectedOption = teamId;
    }

    const response = await PublicSurveyApi.submitAnswer(answer, teamId);
    setAnswerCookie(question.questionText + question.id, Number(Array.isArray(vote) ? vote[0] : vote));
    return response;
}

export const setAnswerCookie = (questionString: string, answer: number): void => {
    const answerCookie: AnswerCookieDTO = {
        answerId: answer.toString(),
    }
    Cookies.set(questionString, JSON.stringify(answerCookie), { expires: 1, sameSite: 'strict' });
}