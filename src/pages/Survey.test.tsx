import { screen, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { backend, stubDefaultBackend, stubScheduleState } from '../test/backend';
import { makeQuestion } from '../test/fixtures';
import { expectErrorToast } from '../test/overlays';
import { currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import { stompClient } from '../test/stomp';
import { QuestionType } from '../util/service/util';
import Survey from './Survey';

const VISIBLE_URL = '/public/survey/visible';
const EMPTY = 'Gerade finden keine Abstimmungen statt.';

const renderPage = () => {
    const setShowTab2 = vi.fn();
    const view = renderWithRouter(<Survey showTab2={true} setShowTab2={setShowTab2} />, { route: '/survey' });
    return { ...view, setShowTab2 };
};

// The question texts in the order the page lists them
const questionTitles = () => screen.queryAllByRole('heading', { level: 3 }).map(heading => heading.textContent);

describe('Survey', () => {
    beforeEach(() => {
        stubDefaultBackend();
        backend.get(VISIBLE_URL, []);
        loginAsTeam({ teamId: 4 });
    });

    it('says that there are no surveys when none is visible', async () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Abstimmungen' })).toBeInTheDocument();
        expect(await screen.findByText(EMPTY)).toBeInTheDocument();
    });

    it('shows a card for every type of question', async () => {
        backend.get(VISIBLE_URL, [
            makeQuestion({ id: 1, questionText: 'Wer gewinnt?', questionType: QuestionType.MULTIPLE_CHOICE }),
            makeQuestion({ id: 2, questionText: 'Welche Strecken?', questionType: QuestionType.CHECKBOX }),
            makeQuestion({ id: 3, questionText: 'Bestes Team?', questionType: QuestionType.TEAM, options: ['Team Mario', 'Team Luigi'] }),
            makeQuestion({ id: 4, questionText: 'Euer Motto?', questionType: QuestionType.TEAM_ONE_FREE_TEXT, options: [] }),
            makeQuestion({ id: 5, questionText: 'Feedback?', questionType: QuestionType.FREE_TEXT, options: [] }),
        ]);

        renderPage();

        await waitFor(() => expect(questionTitles()).toEqual(['Wer gewinnt?', 'Welche Strecken?', 'Bestes Team?', 'Euer Motto?', 'Feedback?']));
        expect(screen.queryByText(EMPTY)).not.toBeInTheDocument();
        expect(screen.getAllByText('Antwort speichern')).toHaveLength(2);
        expect(screen.getByText('Antworten speichern')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Dein Feedback')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Deine Team-Antwort/)).toBeInTheDocument();
    });

    it('marks a question of an unknown type as an error', async () => {
        backend.get(VISIBLE_URL, [makeQuestion({ id: 1, questionType: 'RANKING' as QuestionType })]);

        renderPage();

        expect(await screen.findByText('Fehler')).toBeInTheDocument();
    });

    it('lists open questions before closed ones, unanswered before answered, and feedback last', async () => {
        Cookies.set('Schon beantwortet2', JSON.stringify({ answerId: '0' }));
        backend
            .get(VISIBLE_URL, [
                makeQuestion({ id: 1, questionText: 'Geschlossen', active: false }),
                makeQuestion({ id: 2, questionText: 'Schon beantwortet' }),
                makeQuestion({ id: 3, questionText: 'Feedback', questionType: QuestionType.FREE_TEXT, options: [] }),
                makeQuestion({ id: 4, questionText: 'Offen' }),
            ])
            .get('/public/survey/1/statistics', [1, 0, 0, 0]);

        renderPage();

        await waitFor(() => expect(questionTitles()).toEqual(['Offen', 'Feedback', 'Schon beantwortet', 'Geschlossen']));
    });

    it('shows an error when the questions cannot be loaded', async () => {
        backend.fail('GET', VISIBLE_URL, 500);

        renderPage();

        await expectErrorToast('Fragen konnten nicht geladen werden');
    });

    it('sends the team to the admin area while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin'));
    });

    it('hides the ranking tab during the last round of the group phase', async () => {
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 1 });

        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(false));
    });

    it('reloads the questions when the backend announces a change over the WebSocket', async () => {
        renderPage();
        await screen.findByText(EMPTY);

        stompClient().simulateConnect();
        await waitFor(() => expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', expect.any(Function)), { timeout: 2000 });
        backend.get(VISIBLE_URL, [makeQuestion({ id: 1, questionText: 'Neue Frage' })]);
        const onMessage = stompClient().subscribe.mock.calls[0][1] as () => void;
        onMessage();

        await waitFor(() => expect(questionTitles()).toEqual(['Neue Frage']));
    });

    it('reloads the questions on pull-to-refresh', async () => {
        const { container } = renderPage();
        await screen.findByText(EMPTY);
        backend.get(VISIBLE_URL, [makeQuestion({ id: 1, questionText: 'Neue Frage' })]);

        const complete = pullToRefresh(container);

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(questionTitles()).toEqual(['Neue Frage']);
    });
});
