import Cookies from 'js-cookie';
import { backend } from '../../../test/backend';
import { makeAnswer, makeQuestion } from '../../../test/fixtures';
import { QuestionType } from '../util';
import { AdminSurveyService, PublicSurveyService } from './index';

const ANSWER_URL = '/public/survey/answer';

const TYPES_WITHOUT_OPTIONS = [QuestionType.FREE_TEXT, QuestionType.TEAM, QuestionType.TEAM_ONE_FREE_TEXT];
const TYPES_WITH_OPTIONS = [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX];

describe('AdminSurveyService', () => {
    describe('createQuestion', () => {
        it('creates the question hidden, inactive and not live', async () => {
            const created = makeQuestion({ id: 12 });
            backend.post('/admin/survey', created);

            const result = await AdminSurveyService.createQuestion('Wer gewinnt?', QuestionType.MULTIPLE_CHOICE, ['Mario', 'Luigi'], true, true);

            expect(result).toEqual(created);
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: '/admin/survey',
                body: {
                    questionText: 'Wer gewinnt?',
                    questionType: 'MULTIPLE_CHOICE',
                    options: ['Mario', 'Luigi'],
                    active: false,
                    visible: false,
                    live: false,
                    finalTeamsOnly: true,
                    oneAnswerPerKey: true,
                },
            }]);
        });

        it('rejects an empty question text', async () => {
            await expect(AdminSurveyService.createQuestion('', QuestionType.MULTIPLE_CHOICE, ['a', 'b'], false, false))
                .rejects.toThrow('Die Frage darf nicht leer sein');
            expect(backend.requests).toEqual([]);
        });

        it.each(TYPES_WITH_OPTIONS)('rejects a %s question with fewer than two options', async (type) => {
            await expect(AdminSurveyService.createQuestion('Frage', type, ['nur eine'], false, false))
                .rejects.toThrow('Es müssen mindestens 2 Optionen angegeben werden');
            expect(backend.requests).toEqual([]);
        });

        it.each(TYPES_WITH_OPTIONS)('rejects a %s question with an empty option', async (type) => {
            await expect(AdminSurveyService.createQuestion('Frage', type, ['a', '', 'c'], false, false))
                .rejects.toThrow('Alle Optionen müssen ausgefüllt sein');
            expect(backend.requests).toEqual([]);
        });

        it.each(TYPES_WITHOUT_OPTIONS)('accepts a %s question without usable options', async (type) => {
            backend.post('/admin/survey', makeQuestion({ questionType: type }));

            await expect(AdminSurveyService.createQuestion('Frage', type, ['', ''], false, false)).resolves.toBeDefined();
            await expect(AdminSurveyService.createQuestion('Frage', type, [], false, false)).resolves.toBeDefined();
        });
    });

    describe('updateQuestion', () => {
        it('sends the editable fields of the question', async () => {
            const question = makeQuestion({ id: 5, active: true, visible: true, live: true, finalTeamsOnly: true, oneAnswerPerKey: true });
            backend.put('/admin/survey/5', question);

            await expect(AdminSurveyService.updateQuestion(question)).resolves.toEqual(question);
            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/survey/5',
                body: {
                    questionText: 'Wer gewinnt?',
                    questionType: 'MULTIPLE_CHOICE',
                    options: ['Mario', 'Luigi', 'Peach', 'Toad'],
                    active: true,
                    visible: true,
                    live: true,
                    finalTeamsOnly: true,
                    oneAnswerPerKey: true,
                },
            }]);
        });

        it('rejects an empty question text', async () => {
            await expect(AdminSurveyService.updateQuestion(makeQuestion({ questionText: '' })))
                .rejects.toThrow('Die Frage darf nicht leer sein');
            expect(backend.requests).toEqual([]);
        });

        it.each([...TYPES_WITH_OPTIONS, QuestionType.TEAM])('rejects a %s question with fewer than two options', async (type) => {
            await expect(AdminSurveyService.updateQuestion(makeQuestion({ questionType: type, options: ['nur eine'] })))
                .rejects.toThrow('Es müssen mindestens 2 Optionen angegeben werden');
            expect(backend.requests).toEqual([]);
        });

        it.each([...TYPES_WITH_OPTIONS, QuestionType.TEAM])('rejects a %s question with an empty option', async (type) => {
            await expect(AdminSurveyService.updateQuestion(makeQuestion({ questionType: type, options: ['a', ''] })))
                .rejects.toThrow('Alle Optionen müssen ausgefüllt sein');
            expect(backend.requests).toEqual([]);
        });

        it.each([QuestionType.FREE_TEXT, QuestionType.TEAM_ONE_FREE_TEXT])('drops the options of a %s question', async (type) => {
            const question = makeQuestion({ id: 5, questionType: type, options: ['', 'übrig'] });
            backend.put('/admin/survey/5', question);

            await AdminSurveyService.updateQuestion(question);

            expect(backend.requests[0].body).toMatchObject({ questionType: type, options: [] });
        });
    });

    describe('delete', () => {
        it('deleteQuestion deletes the question by its id', async () => {
            backend.delete('/admin/survey/5');

            await AdminSurveyService.deleteQuestion(makeQuestion({ id: 5 }));

            expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/survey/5', body: undefined }]);
        });

        it('deleteAllQuestions deletes the questions one by one', async () => {
            backend
                .get('/admin/survey', [makeQuestion({ id: 1 }), makeQuestion({ id: 2 }), makeQuestion({ id: 3 })])
                .delete(/^\/admin\/survey\/\d+$/);

            await AdminSurveyService.deleteAllQuestions();

            expect(backend.requests.map(request => `${request.method} ${request.url}`)).toEqual([
                'GET /admin/survey',
                'DELETE /admin/survey/1',
                'DELETE /admin/survey/2',
                'DELETE /admin/survey/3',
            ]);
        });

        it('deleteAllQuestions fails when a question cannot be deleted', async () => {
            backend
                .get('/admin/survey', [makeQuestion({ id: 1 }), makeQuestion({ id: 2 })])
                .fail('DELETE', '/admin/survey/1', 401)
                .delete('/admin/survey/2');

            await expect(AdminSurveyService.deleteAllQuestions()).rejects.toThrow('Nicht autorisierter Zugriff');
        });
    });

    describe('read', () => {
        it('getQuestions returns all questions', async () => {
            const questions = [makeQuestion({ id: 1 }), makeQuestion({ id: 2 })];
            backend.get('/admin/survey', questions);

            await expect(AdminSurveyService.getQuestions()).resolves.toEqual(questions);
        });

        it('getAnswersOfQuestion returns the answers', async () => {
            const answers = [makeAnswer({ questionId: 5, freeTextAnswer: 'Super Turnier' })];
            backend.get('/admin/survey/5/answers', answers);

            await expect(AdminSurveyService.getAnswersOfQuestion(5)).resolves.toEqual(answers);
        });

        it('getStatisticsOfQuestion returns the votes per option', async () => {
            backend.get('/admin/survey/5/statistics', [4, 0, 2]);

            await expect(AdminSurveyService.getStatisticsOfQuestion(5)).resolves.toEqual([4, 0, 2]);
        });

        it('getNumberOfAnswers returns the count', async () => {
            backend.get('/admin/survey/5/answers/count', 6);

            await expect(AdminSurveyService.getNumberOfAnswers(5)).resolves.toBe(6);
        });

        it('answers for the placeholder question (id -1) without calling the backend', async () => {
            await expect(AdminSurveyService.getStatisticsOfQuestion(-1)).resolves.toEqual([]);
            await expect(AdminSurveyService.getNumberOfAnswers(-1)).resolves.toBe(0);
            expect(backend.requests).toEqual([]);
        });
    });
});

describe('PublicSurveyService', () => {
    describe('read', () => {
        it('getVisibleQuestions returns the visible questions', async () => {
            const questions = [makeQuestion({ id: 1 })];
            backend.get('/public/survey/visible', questions);

            await expect(PublicSurveyService.getVisibleQuestions()).resolves.toEqual(questions);
        });

        it('getStatisticsOfQuestion returns the votes per option', async () => {
            backend.get('/public/survey/5/statistics', [1, 2, 3]);

            await expect(PublicSurveyService.getStatisticsOfQuestion(5)).resolves.toEqual([1, 2, 3]);
        });
    });

    describe('answer cookie', () => {
        it('getAnswerCookie returns -1 for a question that was not answered', () => {
            expect(PublicSurveyService.getAnswerCookie('Wer gewinnt?1')).toBe(-1);
        });

        it('setAnswerCookie stores the answer so getAnswerCookie finds it', () => {
            PublicSurveyService.setAnswerCookie('Wer gewinnt?1', 3);

            expect(PublicSurveyService.getAnswerCookie('Wer gewinnt?1')).toEqual({ answerId: '3' });
        });

        it('keeps answers of different questions apart', () => {
            PublicSurveyService.setAnswerCookie('Wer gewinnt?1', 3);

            expect(PublicSurveyService.getAnswerCookie('Wer gewinnt?2')).toBe(-1);
        });
    });

    describe('submitAnswer', () => {
        it('rejects an answer to a closed question', async () => {
            await expect(PublicSurveyService.submitAnswer(makeQuestion({ active: false }), 1, 4))
                .rejects.toThrow('Die Umfrage ist bereits beendet');
            expect(backend.requests).toEqual([]);
        });

        it('rejects an empty text answer', async () => {
            await expect(PublicSurveyService.submitAnswer(makeQuestion({ questionType: QuestionType.FREE_TEXT }), '', 4))
                .rejects.toThrow('Die Antwort darf nicht leer sein');
            expect(backend.requests).toEqual([]);
        });

        it.each([
            ['no selected option', -1],
            ['an empty selection', []],
            ['a selection containing an unselected entry', [0, -1]],
        ])('rejects %s', async (_description, vote) => {
            await expect(PublicSurveyService.submitAnswer(makeQuestion(), vote as number | number[], 4))
                .rejects.toThrow('Es wurde keine Antwort ausgewählt');
            expect(backend.requests).toEqual([]);
        });

        it('submits the selected option of a multiple choice question', async () => {
            const saved = makeAnswer({ multipleChoiceSelectedOption: 2 });
            backend.post(ANSWER_URL, saved);

            await expect(PublicSurveyService.submitAnswer(makeQuestion({ id: 7 }), 2, 4)).resolves.toEqual(saved);
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: ANSWER_URL,
                body: {
                    questionId: 7,
                    answerType: 'MULTIPLE_CHOICE',
                    freeTextAnswer: '',
                    multipleChoiceSelectedOption: 2,
                    checkboxSelectedOptions: [],
                    teamSelectedOption: -1,
                },
            }]);
        });

        it('submits option 0, which must not be mistaken for "nothing selected"', async () => {
            backend.post(ANSWER_URL, makeAnswer());

            await PublicSurveyService.submitAnswer(makeQuestion({ id: 7 }), 0, 4);

            expect(backend.requests[0].body).toMatchObject({ multipleChoiceSelectedOption: 0 });
        });

        it('submits all selected options of a checkbox question', async () => {
            backend.post(ANSWER_URL, makeAnswer());

            await PublicSurveyService.submitAnswer(makeQuestion({ id: 7, questionType: QuestionType.CHECKBOX }), [0, 2], 4);

            expect(backend.requests[0].body).toEqual({
                questionId: 7,
                answerType: 'CHECKBOX',
                freeTextAnswer: '',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [0, 2],
                teamSelectedOption: -1,
            });
        });

        it('submits the text of a free text question', async () => {
            backend.post(ANSWER_URL, makeAnswer());

            await PublicSurveyService.submitAnswer(makeQuestion({ id: 7, questionType: QuestionType.FREE_TEXT }), 'Mehr Pizza', 4);

            expect(backend.requests[0].body).toEqual({
                questionId: 7,
                answerType: 'FREE_TEXT',
                freeTextAnswer: 'Mehr Pizza',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [],
                teamSelectedOption: -1,
            });
        });

        it('submits the selected team of a team question', async () => {
            backend.post(ANSWER_URL, makeAnswer());

            await PublicSurveyService.submitAnswer(makeQuestion({ id: 7, questionType: QuestionType.TEAM }), 3, 4);

            expect(backend.requests[0].body).toEqual({
                questionId: 7,
                answerType: 'TEAM',
                freeTextAnswer: '',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [],
                teamSelectedOption: 3,
            });
        });

        it('submits a one-per-team text answer on behalf of the answering team', async () => {
            backend.post(ANSWER_URL, makeAnswer());

            await PublicSurveyService.submitAnswer(makeQuestion({ id: 7, questionType: QuestionType.TEAM_ONE_FREE_TEXT }), 'Unser Motto', 4);

            expect(backend.requests[0].body).toEqual({
                questionId: 7,
                answerType: 'TEAM_ONE_FREE_TEXT',
                freeTextAnswer: 'Unser Motto',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [],
                teamSelectedOption: 4,
            });
        });

        it('remembers the selected option in the answer cookie of the question', async () => {
            backend.post(ANSWER_URL, makeAnswer());
            const question = makeQuestion({ id: 7, questionText: 'Wer gewinnt?' });

            await PublicSurveyService.submitAnswer(question, 2, 4);

            expect(PublicSurveyService.getAnswerCookie('Wer gewinnt?7')).toEqual({ answerId: '2' });
        });

        it.each([
            [QuestionType.CHECKBOX, [1, 3]],
            [QuestionType.FREE_TEXT, 'Mehr Pizza'],
            [QuestionType.TEAM_ONE_FREE_TEXT, 'Unser Motto'],
        ])('remembers that a %s question was answered', async (type, vote) => {
            backend.post(ANSWER_URL, makeAnswer());
            const question = makeQuestion({ id: 7, questionText: 'Frage', questionType: type });

            await PublicSurveyService.submitAnswer(question, vote as string | number[], 4);

            expect(PublicSurveyService.getAnswerCookie('Frage7')).not.toBe(-1);
        });

        it('does not remember an answer the backend rejected', async () => {
            backend.fail('POST', ANSWER_URL, 429);

            await expect(PublicSurveyService.submitAnswer(makeQuestion({ id: 7 }), 2, 4))
                .rejects.toThrow('Dein Team hat zu oft geantwortet');
            expect(Cookies.get('Wer gewinnt?7')).toBeUndefined();
        });
    });
});
