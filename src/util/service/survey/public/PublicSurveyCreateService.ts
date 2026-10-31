import Cookies from "js-cookie";
import { PublicSurveyApi } from "../../../api";
import { AnswerCookieDTO, AnswerInputDTO, AnswerReturnDTO, QuestionReturnDTO } from "../../../api/config/dto";
import { QuestionType } from "../../util";

export const MAX_FREE_TEXT_ANSWER_LENGTH = 1000;

const TEXT_ANSWERED = '0';

export const submitAnswer = async (question: QuestionReturnDTO, vote: string | number | number[], teamId: number): Promise<AnswerReturnDTO> => {
    if (!question.active) {
        throw new Error('Die Umfrage ist bereits beendet');
    } else if (vote === '') {
        throw new Error('Die Antwort darf nicht leer sein');
    } else if (typeof vote === 'string' && vote.length > MAX_FREE_TEXT_ANSWER_LENGTH) {
        throw new Error(`Die Antwort darf höchstens ${MAX_FREE_TEXT_ANSWER_LENGTH} Zeichen lang sein`);
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

    const response = await PublicSurveyApi.submitAnswer(answer);
    setAnswerCookie(question.questionText + question.id, answerCookieValue(vote));
    return response;
}

const answerCookieValue = (vote: string | number | number[]): string | number => {
    if (Array.isArray(vote)) {
        return vote.join(',');
    }
    return typeof vote === 'number' ? vote : TEXT_ANSWERED;
}

export const setAnswerCookie = (questionString: string, answer: string | number): void => {
    const answerCookie: AnswerCookieDTO = {
        answerId: answer.toString(),
    }
    Cookies.set(questionString, JSON.stringify(answerCookie), { expires: 1, sameSite: 'strict' });
}