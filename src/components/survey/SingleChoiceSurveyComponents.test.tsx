import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { checkmarkCircleOutline, megaphoneOutline, statsChartOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';
import React from 'react';
import { backend } from '../../test/backend';
import { makeAnswer, makeQuestion } from '../../test/fixtures';
import { buttonOf, loginAsTeam } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { QuestionReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import MultipleChoiceSurveyComponent from './MultipleChoiceSurveyComponent';
import TeamSurveyComponent from './TeamSurveyComponent';

const ANSWER_URL = '/public/survey/answer';
const SAVE = 'Antwort speichern';

interface Variant {
    name: string;
    type: QuestionType;
    renderCard: (question: QuestionReturnDTO, toggleAccordion: () => void) => React.ReactElement;
    // The answer fields this question type is expected to submit for option index 2
    submittedSelection: Record<string, number>;
}

const variants: Variant[] = [
    {
        name: 'MultipleChoiceSurveyComponent',
        type: QuestionType.MULTIPLE_CHOICE,
        renderCard: (question, toggleAccordion) => <MultipleChoiceSurveyComponent multipleChoiceQuestion={question} toggleAccordion={toggleAccordion} />,
        submittedSelection: { multipleChoiceSelectedOption: 2, teamSelectedOption: -1 },
    },
    {
        name: 'TeamSurveyComponent',
        type: QuestionType.TEAM,
        renderCard: (question, toggleAccordion) => <TeamSurveyComponent teamQuestion={question} toggleAccordion={toggleAccordion} />,
        submittedSelection: { multipleChoiceSelectedOption: -1, teamSelectedOption: 2 },
    },
];

describe.each(variants)('$name', ({ type, renderCard, submittedSelection }) => {
    const question = (overrides: Partial<QuestionReturnDTO> = {}) =>
        makeQuestion({ id: 7, questionText: 'Wer gewinnt?', questionType: type, options: ['Mario', 'Luigi', 'Peach', 'Toad'], ...overrides });

    const renderQuestion = (overrides: Partial<QuestionReturnDTO> = {}) => {
        const toggleAccordion = vi.fn();
        const view = render(renderCard(question(overrides), toggleAccordion));
        return { ...view, toggleAccordion };
    };

    const statusIcon = (container: HTMLElement) => container.querySelector('ion-item ion-icon') as HTMLIonIconElement;
    const header = (container: HTMLElement) => container.querySelector('ion-item') as HTMLIonItemElement;
    const markAsAnswered = (option: number) => Cookies.set('Wer gewinnt?7', JSON.stringify({ answerId: String(option) }));

    describe('an open question that was not answered yet', () => {
        it('shows the question, its options and a megaphone', async () => {
            const { container } = renderQuestion();

            expect(screen.getByRole('heading', { name: 'Wer gewinnt?' })).toBeInTheDocument();
            ['Mario', 'Luigi', 'Peach', 'Toad'].forEach(option => expect(screen.getByText(option)).toBeInTheDocument());
            await waitFor(() => expect(statusIcon(container).icon).toBe(megaphoneOutline));
            expect(header(container).disabled).toBe(false);
        });

        it('cannot be saved before an option is selected', () => {
            renderQuestion();

            expect(buttonOf(SAVE).disabled).toBe(true);
        });

        it('highlights the selected option and enables saving', () => {
            renderQuestion();

            fireEvent.click(screen.getByText('Peach'));

            expect(buttonOf('Peach')).toHaveStyle({ opacity: '1' });
            expect(buttonOf('Mario')).toHaveStyle({ opacity: '0.5' });
            expect(buttonOf(SAVE).disabled).toBe(false);
        });

        it.each(['Enter', ' '])('selects an option with the "%s" key', (key) => {
            renderQuestion();

            fireEvent.keyDown(buttonOf('Peach'), { key });

            expect(buttonOf('Peach')).toHaveStyle({ opacity: '1' });
        });

        it('submits the selected option for the logged in team', async () => {
            loginAsTeam({ teamId: 4 });
            backend.post(ANSWER_URL, makeAnswer());
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Peach'));
            fireEvent.click(screen.getByText(SAVE));

            await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: ANSWER_URL,
                body: {
                    questionId: 7,
                    answerType: type,
                    freeTextAnswer: '',
                    checkboxSelectedOptions: [],
                    ...submittedSelection,
                },
            }]);
        });

        it.each(['Enter', ' '])('submits with the "%s" key', async (key) => {
            backend.post(ANSWER_URL, makeAnswer());
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Peach'));
            fireEvent.keyDown(buttonOf(SAVE), { key });

            await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
        });

        it('locks the question after the answer was saved', async () => {
            backend.post(ANSWER_URL, makeAnswer());
            const { container } = renderQuestion();

            fireEvent.click(screen.getByText('Peach'));
            fireEvent.click(screen.getByText(SAVE));

            await waitFor(() => expect(screen.queryByText(SAVE)).not.toBeInTheDocument());
            expect(statusIcon(container).icon).toBe(checkmarkCircleOutline);
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Peach').disabled).toBe(false);
            expect(buttonOf('Mario').disabled).toBe(true);
        });

        it('shows the error and stays open when the answer is rejected', async () => {
            backend.fail('POST', ANSWER_URL, 429);
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Peach'));
            fireEvent.click(screen.getByText(SAVE));

            await expectErrorToast('Dein Team hat zu oft geantwortet');
            expect(toggleAccordion).not.toHaveBeenCalled();
            expect(screen.getByText(SAVE)).toBeInTheDocument();
        });

        it('does not load results', () => {
            const { container } = renderQuestion();

            fireEvent.click(header(container));

            expect(backend.requests).toEqual([]);
            expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
        });
    });

    describe('an open question that was already answered', () => {
        it('shows a checkmark and only the chosen option as selected', async () => {
            markAsAnswered(1);

            const { container } = renderQuestion();

            await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Luigi')).toHaveStyle({ opacity: '1' });
            expect(buttonOf('Luigi').disabled).toBe(false);
            ['Mario', 'Peach', 'Toad'].forEach(option => {
                expect(buttonOf(option)).toHaveStyle({ opacity: '0.5' });
                expect(buttonOf(option).disabled).toBe(true);
            });
        });

        it('cannot be answered again', async () => {
            markAsAnswered(1);

            const { container } = renderQuestion();
            await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));

            expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
            fireEvent.click(screen.getByText('Peach'));
            expect(buttonOf('Peach')).toHaveStyle({ opacity: '0.5' });
        });
    });

    describe('a closed question', () => {
        it('shows the share of votes per option and a statistics icon', async () => {
            backend.get('/public/survey/7/statistics', [3, 1, 0, 4]);

            const { container } = renderQuestion({ active: false });

            await waitFor(() => expect(buttonOf('Mario')).toHaveTextContent('38%'));
            expect(buttonOf('Luigi')).toHaveTextContent('13%');
            expect(buttonOf('Peach')).toHaveTextContent('0%');
            expect(buttonOf('Toad')).toHaveTextContent('50%');
            expect(statusIcon(container).icon).toBe(statsChartOutline);
        });

        it('shows 0% everywhere when nobody voted', async () => {
            backend.get('/public/survey/7/statistics', [0, 0, 0, 0]);

            renderQuestion({ active: false });

            await waitFor(() => expect(backend.requests).toHaveLength(1));
            ['Mario', 'Luigi', 'Peach', 'Toad'].forEach(option => expect(buttonOf(option)).toHaveTextContent('0%'));
        });

        it('cannot be answered', async () => {
            backend.get('/public/survey/7/statistics', [3, 1, 0, 4]);

            const { container } = renderQuestion({ active: false });

            await waitFor(() => expect(buttonOf('Mario')).toHaveTextContent('38%'));
            expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Mario')).toHaveClass('bsurvey');
            expect(buttonOf('Mario')).toHaveStyle({ pointerEvents: 'none' });
        });

        it('reloads the results when the header is activated', async () => {
            backend.get('/public/survey/7/statistics', [3, 1, 0, 4]);
            const { container } = renderQuestion({ active: false });
            await waitFor(() => expect(buttonOf('Mario')).toHaveTextContent('38%'));

            backend.get('/public/survey/7/statistics', [5, 5, 0, 0]);
            fireEvent.click(header(container));

            await waitFor(() => expect(buttonOf('Mario')).toHaveTextContent('50%'));
        });
    });
});
