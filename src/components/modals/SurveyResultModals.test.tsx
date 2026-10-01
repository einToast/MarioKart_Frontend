import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { lastBarProps } from '../../test/charts';
import { makeAnswer, makeQuestion, makeTeams } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { QuestionReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import SurveyAnswerModal from './SurveyAnswerModal';
import SurveyStatisticsModal from './SurveyStatisticsModal';

const CLOSE = 'Ergebnisse schließen';

const question = (overrides: Partial<QuestionReturnDTO> = {}) =>
    makeQuestion({ id: 7, questionText: 'Wer gewinnt?', options: ['Mario', 'Luigi', 'Peach'], ...overrides });

const listItems = () => screen.queryAllByRole('listitem').map(item => item.textContent?.trim());

describe('SurveyAnswerModal', () => {
    const renderModal = (overrides: Partial<QuestionReturnDTO> = {}, showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<SurveyAnswerModal showModal={showModal} closeModal={closeModal} question={question(overrides)} />);
        return { ...view, closeModal };
    };

    it('stays hidden and loads nothing while closed', () => {
        renderModal({}, false);

        expect(screen.queryByText(/Ergebnisse:/)).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it.each([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.TEAM])('lists the votes per option of a %s question', async (questionType) => {
        backend
            .get('/admin/survey/7/statistics', [4, 0, 2])
            .get('/admin/survey/7/answers/count', 6);

        renderModal({ questionType });

        expect(await screen.findByText('Ergebnisse: 6 Antworten')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Wer gewinnt?' })).toBeInTheDocument();
        expect(listItems()).toEqual(['Mario: 4', 'Luigi: 0', 'Peach: 2']);
    });

    it('lists the texts of a free text question', async () => {
        backend
            .get('/admin/survey/7/answers', [makeAnswer({ freeTextAnswer: 'Mehr Pizza' }), makeAnswer({ freeTextAnswer: 'Tolles Turnier' })])
            .get('/admin/survey/7/answers/count', 2);

        renderModal({ questionType: QuestionType.FREE_TEXT, options: [] });

        expect(await screen.findByText('Ergebnisse: 2 Antworten')).toBeInTheDocument();
        expect(listItems()).toEqual(['Mehr Pizza', 'Tolles Turnier']);
    });

    it('lists the texts of a one-per-team question next to the answering team', async () => {
        backend
            .get('/admin/survey/7/answers', [
                makeAnswer({ freeTextAnswer: 'Immer Vollgas', teamSelectedOption: 2 }),
                makeAnswer({ freeTextAnswer: 'Pilze für alle', teamSelectedOption: 4 }),
            ])
            .get('/admin/survey/7/answers/count', 2)
            .get('/public/teams', makeTeams());

        renderModal({ questionType: QuestionType.TEAM_ONE_FREE_TEXT, options: [] });

        await waitFor(() => expect(listItems()).toEqual(['Team Luigi: Immer Vollgas', 'Team Toad: Pilze für alle']));
        expect(screen.getByText('Ergebnisse: 2 Antworten')).toBeInTheDocument();
    });

    it('shows an error when the results cannot be loaded', async () => {
        backend
            .fail('GET', '/admin/survey/7/statistics', 400)
            .get('/admin/survey/7/answers/count', 6);

        renderModal();

        await expectErrorToast('Frage ist nicht auswertbar');
        expect(screen.getByText('Ergebnisse: 0 Antworten')).toBeInTheDocument();
    });

    it('shows an error when the answers of a free text question cannot be loaded', async () => {
        backend
            .fail('GET', '/admin/survey/7/answers', 404)
            .get('/admin/survey/7/answers/count', 2);

        renderModal({ questionType: QuestionType.FREE_TEXT, options: [] });

        await expectErrorToast('Frage konnte nicht gefunden werden');
    });

    it('shows an error when the teams cannot be loaded', async () => {
        backend
            .get('/admin/survey/7/answers', [])
            .get('/admin/survey/7/answers/count', 0)
            .fail('GET', '/public/teams', 500);

        renderModal({ questionType: QuestionType.TEAM_ONE_FREE_TEXT, options: [] });

        await expectErrorToast('Teams konnten nicht geladen werden');
    });

    it.each([
        ['click', () => fireEvent.click(screen.getByText(CLOSE))],
        ['Enter key', () => fireEvent.keyDown(buttonOf(CLOSE), { key: 'Enter' })],
        ['space key', () => fireEvent.keyDown(buttonOf(CLOSE), { key: ' ' })],
    ])('closes on %s', async (_name, close) => {
        backend
            .get('/admin/survey/7/statistics', [4, 0, 2])
            .get('/admin/survey/7/answers/count', 6);
        const { closeModal } = renderModal();
        await screen.findByText('Ergebnisse: 6 Antworten');

        close();

        expect(closeModal).toHaveBeenCalledWith({ surveyResults: false });
    });
});

describe('SurveyStatisticsModal', () => {
    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<SurveyStatisticsModal showModal={showModal} closeModal={closeModal} question={question()} />);
        return { ...view, closeModal };
    };

    it('stays hidden and loads nothing while closed', () => {
        renderModal(false);

        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it('charts the votes per option under the question text', async () => {
        backend.get('/admin/survey/7/statistics', [4, 0, 2]);

        renderModal();

        expect(screen.getByRole('heading', { name: 'Wer gewinnt?' })).toBeInTheDocument();
        await waitFor(() => expect(lastBarProps().data.datasets[0].data).toEqual([4, 0, 2]));
        expect(lastBarProps().data.labels).toEqual(['Mario', 'Luigi', 'Peach']);
    });

    it('shows an error when the statistics cannot be loaded', async () => {
        backend.fail('GET', '/admin/survey/7/statistics', 400);

        renderModal();

        await expectErrorToast('Frage ist nicht auswertbar');
    });

    it.each([
        ['click', () => fireEvent.click(screen.getByText(CLOSE))],
        ['Enter key', () => fireEvent.keyDown(buttonOf(CLOSE), { key: 'Enter' })],
        ['space key', () => fireEvent.keyDown(buttonOf(CLOSE), { key: ' ' })],
    ])('closes on %s', async (_name, close) => {
        backend.get('/admin/survey/7/statistics', [4, 0, 2]);
        const { closeModal } = renderModal();
        await waitFor(() => expect(backend.requests).toHaveLength(1));

        close();

        expect(closeModal).toHaveBeenCalledWith({ surveyResults: false });
    });
});
