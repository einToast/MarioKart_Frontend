import {
    createQuestion,
    getVisibleQuestions,
    getAnswersOfQuestion,
    getQuestions,
    submitAnswer,
    updateQuestion, deleteQuestion, deleteQuestions
} from "../api/SurveyApi";
import {AnswerInputDTO, AnswerReturnDTO, QuestionInputDTO, QuestionReturnDTO} from "../api/config/dto";
import Cookies from "js-cookie";
import {QuestionType} from "./util";

export const getCurrentQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return getVisibleQuestions();
}

export const getAllQuestions = async (): Promise<QuestionReturnDTO[]> => {
    return getQuestions();
}

export const submitQuestion = async (question:string, questionType:QuestionType, options:string[]): Promise<QuestionReturnDTO> => {
    if (question === '') {
        throw new Error('Die Frage darf nicht leer sein');
    } else if (options.length < 2 && questionType !== QuestionType.FREE_TEXT) {
        throw new Error('Es müssen mindestens 2 Optionen angegeben werden');
    } else if (options.some(option => option === '') && questionType !== QuestionType.FREE_TEXT) {
        throw new Error('Alle Optionen müssen ausgefüllt sein');
    }
    const questionInput: QuestionInputDTO = {
        questionText: question,
        questionType: questionType,
        options: options,
        active: false,
        visible: false,
        live: false
    }
    return createQuestion(questionInput);
}

export const changeQuestion = async (question: QuestionReturnDTO): Promise<QuestionReturnDTO> => {
    console.log('test1')
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
        live: question.live
    }
    console.log(questionInput);
    return updateQuestion(question.id, questionInput);
}

export const getAnswers = async (questionId: number): Promise<AnswerReturnDTO[]> => {
    return getAnswersOfQuestion(questionId);
}

export const registerAnswer = async (question: QuestionReturnDTO, vote: any): Promise<AnswerReturnDTO> => {
    if (!question.active) {
        throw new Error('Die Umfrage ist bereits beendet');
    } else if (vote === '') {
        throw new Error('Die Antwort darf nicht leer sein');
    } else if ((vote === -1 && !(typeof vote === 'string')) || (vote.includes(-1) && !(typeof vote === 'string'))|| vote.length === 0) {
        throw new Error('Es wurde keine Antwort ausgewählt');
    }

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
    console.log(answerCookie);
    Cookies.set(questionString, JSON.stringify(answerCookie), {expires: 1,sameSite: 'strict'});
}

export const getAnswer = async (questionString: string): Promise<any> => {
    const answerCookie = Cookies.get(questionString);
    if (answerCookie) {
        return JSON.parse(answerCookie)
    }
    return -1;
}

export const removeQuestion = async (question: QuestionReturnDTO): Promise<void> => {
    return await deleteQuestion(question.id);
}

export const removeQuestions = async (): Promise<void> => {
    return await deleteQuestions();
}