import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { checkmarkCircleOutline, megaphoneOutline, statsChartOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { backend } from '../../test/backend';
import { makeAnswer, makeQuestion } from '../../test/fixtures';
import { buttonOf, loginAsTeam } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { QuestionReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import FreeTextSurveyComponent from './FreeTextSurveyComponent';
import TeamOneFreeTextSurveyComponent from './TeamOneFreeTextSurveyComponent';

const ANSWER_URL = '/public/survey/answer';
const SAVE = 'Speichern';

const statusIcon = (container: HTMLElement) => container.querySelector('ion-item ion-icon') as HTMLIonIconElement;
const header = (container: HTMLElement) => container.querySelector('ion-item') as HTMLIonItemElement;
const type = (textarea: HTMLElement, text: string) => fireEvent.change(textarea, { target: { value: text } });

describe('FreeTextSurveyComponent', () => {
    const renderQuestion = (overrides: Partial<QuestionReturnDTO> = {}) => {
        const toggleAccordion = vi.fn();
        const question = makeQuestion({ id: 7, questionText: 'Feedback?', questionType: QuestionType.FREE_TEXT, options: [], ...overrides });
        const view = render(<FreeTextSurveyComponent freeTextQuestion={question} toggleAccordion={toggleAccordion} />);
        return { ...view, toggleAccordion };
    };

    it('shows the question with an input for feedback and a megaphone', () => {
        const { container } = renderQuestion();

        expect(screen.getByRole('heading', { name: 'Feedback?' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Dein Feedback')).toBeEnabled();
        expect(statusIcon(container).icon).toBe(megaphoneOutline);
        expect(header(container).disabled).toBe(false);
    });

    it('submits the entered text for the logged in team', async () => {
        loginAsTeam({ teamId: 4 });
        backend.post(ANSWER_URL, makeAnswer());
        const { toggleAccordion } = renderQuestion();

        type(screen.getByPlaceholderText('Dein Feedback'), 'Mehr Pizza');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
        expect(backend.requests).toEqual([{
            method: 'POST',
            url: ANSWER_URL,
            body: {
                questionId: 7,
                answerType: 'FREE_TEXT',
                freeTextAnswer: 'Mehr Pizza',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [],
                teamSelectedOption: -1,
            },
        }]);
    });

    it.each(['Enter', ' '])('submits with the "%s" key', async (key) => {
        backend.post(ANSWER_URL, makeAnswer());
        const { toggleAccordion } = renderQuestion();

        type(screen.getByPlaceholderText('Dein Feedback'), 'Mehr Pizza');
        fireEvent.keyDown(buttonOf(SAVE), { key });

        await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
    });

    it('clears the input after saving so further feedback can be given', async () => {
        backend.post(ANSWER_URL, makeAnswer());
        renderQuestion();

        type(screen.getByPlaceholderText('Dein Feedback'), 'Mehr Pizza');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(screen.getByPlaceholderText('Dein Feedback')).toHaveValue(''));
        expect(screen.getByPlaceholderText('Dein Feedback')).toBeEnabled();
        expect(screen.getByText(SAVE)).toBeInTheDocument();
    });

    it('refuses to submit an empty text', async () => {
        const { toggleAccordion } = renderQuestion();

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Die Antwort darf nicht leer sein');
        expect(backend.requests).toEqual([]);
        expect(toggleAccordion).not.toHaveBeenCalled();
    });

    it('keeps the text and shows the error when the answer is rejected', async () => {
        backend.fail('POST', ANSWER_URL, 403);
        renderQuestion();

        type(screen.getByPlaceholderText('Dein Feedback'), 'Mehr Pizza');
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Die Teilnahme ist nur noch für Geräte möglich, die bereits an einer Umfrage teilgenommen haben');
        expect(screen.getByPlaceholderText('Dein Feedback')).toHaveValue('Mehr Pizza');
    });

    it('is read-only once the question is closed', () => {
        const { container } = renderQuestion({ active: false });

        expect(screen.getByPlaceholderText('Umfrage geschlossen')).toBeDisabled();
        expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
        expect(statusIcon(container).icon).toBe(statsChartOutline);
        expect(header(container).disabled).toBe(true);
    });
});

describe('TeamOneFreeTextSurveyComponent', () => {
    const PLACEHOLDER = 'Deine Team-Antwort (nur ein Eintrag pro Team möglich)';

    const renderQuestion = (overrides: Partial<QuestionReturnDTO> = {}) => {
        const toggleAccordion = vi.fn();
        const question = makeQuestion({ id: 7, questionText: 'Euer Motto?', questionType: QuestionType.TEAM_ONE_FREE_TEXT, options: [], ...overrides });
        const view = render(<TeamOneFreeTextSurveyComponent teamOneFreeTextQuestion={question} toggleAccordion={toggleAccordion} />);
        return { ...view, toggleAccordion };
    };

    it('shows the question with an input for the team answer and a megaphone', async () => {
        const { container } = renderQuestion();

        expect(screen.getByRole('heading', { name: 'Euer Motto?' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeEnabled();
        await waitFor(() => expect(statusIcon(container).icon).toBe(megaphoneOutline));
        expect(header(container).disabled).toBe(false);
    });

    it('submits the entered text on behalf of the logged in team', async () => {
        loginAsTeam({ teamId: 4 });
        backend.post(ANSWER_URL, makeAnswer());
        const { toggleAccordion } = renderQuestion();

        type(screen.getByPlaceholderText(PLACEHOLDER), 'Immer Vollgas');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
        expect(backend.requests).toEqual([{
            method: 'POST',
            url: ANSWER_URL,
            body: {
                questionId: 7,
                answerType: 'TEAM_ONE_FREE_TEXT',
                freeTextAnswer: 'Immer Vollgas',
                multipleChoiceSelectedOption: -1,
                checkboxSelectedOptions: [],
                teamSelectedOption: 4,
            },
        }]);
    });

    it.each(['Enter', ' '])('submits with the "%s" key', async (key) => {
        backend.post(ANSWER_URL, makeAnswer());
        const { toggleAccordion } = renderQuestion();

        type(screen.getByPlaceholderText(PLACEHOLDER), 'Immer Vollgas');
        fireEvent.keyDown(buttonOf(SAVE), { key });

        await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
    });

    it('locks the question after the team answered', async () => {
        backend.post(ANSWER_URL, makeAnswer());
        const { container } = renderQuestion();

        type(screen.getByPlaceholderText(PLACEHOLDER), 'Immer Vollgas');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(screen.queryByText(SAVE)).not.toBeInTheDocument());
        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeDisabled();
        expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveValue('');
        expect(statusIcon(container).icon).toBe(checkmarkCircleOutline);
        expect(header(container).disabled).toBe(true);
    });

    it('stays locked when the page is opened again after answering', async () => {
        Cookies.set('Euer Motto?7', JSON.stringify({ answerId: 'NaN' }));

        const { container } = renderQuestion();

        await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));
        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeDisabled();
        expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
    });

    it('refuses to submit an empty text', async () => {
        const { toggleAccordion } = renderQuestion();

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Die Antwort darf nicht leer sein');
        expect(backend.requests).toEqual([]);
        expect(toggleAccordion).not.toHaveBeenCalled();
    });

    it('keeps the text and shows the error when the answer is rejected', async () => {
        backend.fail('POST', ANSWER_URL, 429);
        renderQuestion();

        type(screen.getByPlaceholderText(PLACEHOLDER), 'Immer Vollgas');
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Dein Team hat zu oft geantwortet');
        expect(screen.getByPlaceholderText(PLACEHOLDER)).toHaveValue('Immer Vollgas');
        expect(screen.getByText(SAVE)).toBeInTheDocument();
    });

    it('is read-only once the question is closed', async () => {
        const { container } = renderQuestion({ active: false });

        expect(screen.getByPlaceholderText('Umfrage geschlossen')).toBeDisabled();
        expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
        await waitFor(() => expect(statusIcon(container).icon).toBe(statsChartOutline));
        expect(header(container).disabled).toBe(true);
    });
});
