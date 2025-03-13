import Cookies from "js-cookie";
import { AnswerCookieDTO, AnswerInputDTO, AnswerReturnDTO, QuestionInputDTO, QuestionReturnDTO } from "../api/config/dto";
import { SurveyApi } from "../api";
import { QuestionType } from "./util";

export const getCurrentQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return SurveyApi.getVisibleQuestions();
}

export const getAllQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return SurveyApi.getQuestions();
}

export const submitQuestion = async (question: string, questionType: QuestionType, options: string[], finalTeamsOnly: boolean): Promise<QuestionReturnDTO> => {
    if (question === '') {
        throw new Error('Die Frage darf nicht leer sein');
    } else if (options.length < 2 && questionType !== QuestionType.FREE_TEXT && questionType !== QuestionType.TEAM) {
        throw new Error('Es müssen mindestens 2 Optionen angegeben werden');
    } else if (options.some(option => option === '') && questionType !== QuestionType.FREE_TEXT && questionType !== QuestionType.TEAM) {
        throw new Error('Alle Optionen müssen ausgefüllt sein');
    }
    const questionInput: QuestionInputDTO = {
        questionText: question,
        questionType: questionType,
        options: options,
        active: false,
        visible: false,
        live: false,
        finalTeamsOnly: finalTeamsOnly
    }
    return SurveyApi.createQuestion(questionInput);
}

export const changeQuestion = async (question: QuestionReturnDTO): Promise<QuestionReturnDTO> => {
    if (question.questionText === '') {
        throw new Error('Die Frage darf nicht leer sein');
    } else if (question.questionType !== QuestionType.FREE_TEXT && question.options.length < 2) {
        throw new Error('Es müssen mindestens 2 Optionen angegeben werden');
    } else if (question.questionType !== QuestionType.FREE_TEXT && question.options.some(option => option === '')) {
        throw new Error('Alle Optionen müssen ausgefüllt sein');
    }
    const questionInput: QuestionInputDTO = {
        questionText: question.questionText,
        questionType: question.questionType,
        options: (question.questionText === QuestionType.FREE_TEXT) ? [] : question.options,
        active: question.active,
        visible: question.visible,
        live: question.live,
        finalTeamsOnly: question.finalTeamsOnly
    }
    return SurveyApi.updateQuestion(question.id, questionInput);
}

export const getAnswers = async (questionId: number): Promise<AnswerReturnDTO[]> => {
    return SurveyApi.getAnswersOfQuestion(questionId);
}

export const registerAnswer = async (question: QuestionReturnDTO, vote: string | number | number[]): Promise<AnswerReturnDTO> => {
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

    const freeTextAnswer = question.questionType === QuestionType.FREE_TEXT ? String(vote) : '';
    const multipleChoiceSelectedOption = question.questionType === QuestionType.MULTIPLE_CHOICE ? Number(vote) : -1;
    const checkboxSelectedOptions = question.questionType === QuestionType.CHECKBOX ? (Array.isArray(vote) ? vote.map(Number) : []) : [];
    const teamSelectedOption = question.questionType === QuestionType.TEAM ? Number(vote) : -1;
    const answer: AnswerInputDTO = {
        questionId: question.id,
        answerType: question.questionType,
        freeTextAnswer: freeTextAnswer,
        multipleChoiceSelectedOption: multipleChoiceSelectedOption,
        checkboxSelectedOptions: checkboxSelectedOptions,
        teamSelectedOption: teamSelectedOption
    }

    const response = await SurveyApi.submitAnswer(answer);

    await setAnswer(question.questionText + question.id, typeof vote === 'number' ? vote : Number(Array.isArray(vote) ? vote[0] : vote));

    return response;
}

export const setAnswer = async (questionString: string, answer: number): Promise<void> => {
    const answerCookie: AnswerCookieDTO = {
        answerId: answer.toString(),
    }
    Cookies.set(questionString, JSON.stringify(answerCookie), { expires: 1, sameSite: 'strict' });
}

export const getAnswer = async (questionString: string): Promise<AnswerCookieDTO | -1> => {
    const answerCookie = Cookies.get(questionString);
    if (answerCookie) {
        return JSON.parse(answerCookie) as AnswerCookieDTO;
    }
    return -1;
}

export const removeQuestion = async (question: QuestionReturnDTO): Promise<void> => {
    return await SurveyApi.deleteQuestion(question.id);
}

export const removeQuestions = async (): Promise<void> => {
    return await SurveyApi.deleteQuestions();
}