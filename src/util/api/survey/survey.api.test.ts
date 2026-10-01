import { backend } from '../../../test/backend';
import { describeEndpoint } from '../../../test/endpoint';
import { makeAnswer, makeQuestion } from '../../../test/fixtures';
import { QuestionType } from '../../service/util';
import { AnswerInputDTO, QuestionInputDTO } from '../config/dto';
import { AdminSurveyApi, PublicSurveyApi } from './index';

const questionInput: QuestionInputDTO = {
    questionText: 'Wer gewinnt?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: ['Mario', 'Luigi'],
    active: false,
    visible: false,
    live: false,
    finalTeamsOnly: false,
    oneAnswerPerKey: false,
};

const answerInput: AnswerInputDTO = {
    questionId: 1,
    answerType: QuestionType.MULTIPLE_CHOICE,
    freeTextAnswer: '',
    multipleChoiceSelectedOption: 2,
    checkboxSelectedOptions: [],
    teamSelectedOption: -1,
};

describe('PublicSurveyApi', () => {
    describeEndpoint('submitAnswer', {
        call: () => PublicSurveyApi.submitAnswer(answerInput, 1),
        method: 'POST',
        url: '/public/survey/answer',
        body: answerInput,
        response: makeAnswer({ multipleChoiceSelectedOption: 2 }),
        errors: {
            429: 'Dein Team hat zu oft geantwortet',
            403: 'Die Teilnahme ist nur noch für Geräte möglich, die bereits an einer Umfrage teilgenommen haben',
            409: 'Frage kann nicht beantwortet werden',
            404: 'Frage nicht gefunden',
            400: 'Du bist nicht authentifiziert, bitte melde dich erneut an',
        },
        fallback: 'Antwort konnte nicht übermittelt werden',
    });

    it('submitAnswer distinguishes a used survey key from the team rate limit on HTTP 429', async () => {
        backend.fail('POST', '/public/survey/answer', 429, 'Answer already submitted for this survey key');

        await expect(PublicSurveyApi.submitAnswer(answerInput, 1))
            .rejects.toThrow(new Error('Du hast diese Frage bereits beantwortet'));
    });

    describeEndpoint('getVisibleQuestions', {
        call: () => PublicSurveyApi.getVisibleQuestions(),
        method: 'GET',
        url: '/public/survey/visible',
        response: [makeQuestion()],
        fallback: 'Fragen konnten nicht geladen werden',
    });

    describeEndpoint('getStatisticsOfQuestion', {
        call: () => PublicSurveyApi.getStatisticsOfQuestion(5),
        method: 'GET',
        url: '/public/survey/5/statistics',
        response: [3, 1, 0, 2],
        errors: {
            409: 'Frage nicht ausgewertet',
            404: 'Frage konnte nicht gefunden werden',
            400: 'Frage ist nicht auswertbar',
        },
        fallback: 'Frage konnte nicht geladen werden',
    });
});

describe('AdminSurveyApi', () => {
    describeEndpoint('createQuestion', {
        call: () => AdminSurveyApi.createQuestion(questionInput),
        method: 'POST',
        url: '/admin/survey',
        body: questionInput,
        response: makeQuestion(),
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Frage konnte nicht erstellt werden',
    });

    describeEndpoint('deleteQuestion', {
        call: () => AdminSurveyApi.deleteQuestion(5),
        method: 'DELETE',
        url: '/admin/survey/5',
        returnsVoid: true,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Frage konnte nicht gelöscht werden',
    });

    describeEndpoint('deleteAllQuestions', {
        call: () => AdminSurveyApi.deleteAllQuestions(),
        method: 'DELETE',
        url: '/admin/survey',
        returnsVoid: true,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Fragen konnten nicht gelöscht werden',
    });

    describeEndpoint('getQuestions', {
        call: () => AdminSurveyApi.getQuestions(),
        method: 'GET',
        url: '/admin/survey',
        response: [makeQuestion()],
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Fragen konnten nicht geladen werden',
    });

    describeEndpoint('getAnswersOfQuestion', {
        call: () => AdminSurveyApi.getAnswersOfQuestion(5),
        method: 'GET',
        url: '/admin/survey/5/answers',
        response: [makeAnswer({ questionId: 5 })],
        errors: {
            404: 'Frage konnte nicht gefunden werden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Frage ist nicht auswertbar',
        },
        fallback: 'Frage konnte nicht geladen werden',
    });

    describeEndpoint('getStatisticsOfQuestion', {
        call: () => AdminSurveyApi.getStatisticsOfQuestion(5),
        method: 'GET',
        url: '/admin/survey/5/statistics',
        response: [3, 1, 0, 2],
        errors: {
            404: 'Frage konnte nicht gefunden werden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Frage ist nicht auswertbar',
        },
        fallback: 'Frage konnte nicht geladen werden',
    });

    describeEndpoint('getNumberOfAnswers', {
        call: () => AdminSurveyApi.getNumberOfAnswers(5),
        method: 'GET',
        url: '/admin/survey/5/answers/count',
        response: 6,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Frage konnte nicht geladen werden',
    });

    describeEndpoint('updateQuestion', {
        call: () => AdminSurveyApi.updateQuestion(5, questionInput),
        method: 'PUT',
        url: '/admin/survey/5',
        body: questionInput,
        response: makeQuestion({ id: 5 }),
        errors: {
            404: 'Frage nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Fragentyp wird nicht unterstützt',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Frage konnte nicht aktualisiert werden',
    });
});
