import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { checkmarkCircleOutline, megaphoneOutline, statsChartOutline } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { backend } from '../../test/backend';
import { makeAnswer, makeQuestion } from '../../test/fixtures';
import { buttonOf, loginAsTeam } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { QuestionReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import CheckBoxSurveyComponent from './CheckBoxSurveyComponent';

const ANSWER_URL = '/public/survey/answer';
const SAVE = 'Antworten speichern';

const renderQuestion = (overrides: Partial<QuestionReturnDTO> = {}) => {
    const toggleAccordion = vi.fn();
    const question = makeQuestion({
        id: 7,
        questionText: 'Welche Strecken?',
        questionType: QuestionType.CHECKBOX,
        options: ['Regenbogen', 'Kuhmuh', 'Bowsers Festung'],
        ...overrides,
    });
    const view = render(<CheckBoxSurveyComponent checkBoxQuestion={question} toggleAccordion={toggleAccordion} />);
    return { ...view, toggleAccordion };
};

const statusIcon = (container: HTMLElement) => container.querySelector('ion-item ion-icon') as HTMLIonIconElement;
const header = (container: HTMLElement) => container.querySelector('ion-item') as HTMLIonItemElement;
const markAsAnswered = (answerId: string) => Cookies.set('Welche Strecken?7', JSON.stringify({ answerId }));

describe('CheckBoxSurveyComponent', () => {
    describe('an open question that was not answered yet', () => {
        it('shows the question, its options and a megaphone', async () => {
            const { container } = renderQuestion();

            expect(screen.getByRole('heading', { name: 'Welche Strecken?' })).toBeInTheDocument();
            ['Regenbogen', 'Kuhmuh', 'Bowsers Festung'].forEach(option => expect(screen.getByText(option)).toBeInTheDocument());
            await waitFor(() => expect(statusIcon(container).icon).toBe(megaphoneOutline));
            expect(header(container).disabled).toBe(false);
        });

        it('cannot be saved before an option is selected', () => {
            renderQuestion();

            expect(buttonOf(SAVE).disabled).toBe(true);
        });

        it('lets the user select several options', () => {
            renderQuestion();

            fireEvent.click(screen.getByText('Regenbogen'));
            fireEvent.click(screen.getByText('Bowsers Festung'));

            expect(buttonOf('Regenbogen')).toHaveStyle({ opacity: '1' });
            expect(buttonOf('Kuhmuh')).toHaveStyle({ opacity: '0.5' });
            expect(buttonOf('Bowsers Festung')).toHaveStyle({ opacity: '1' });
            expect(buttonOf(SAVE).disabled).toBe(false);
        });

        it('deselects an option that is clicked again', () => {
            renderQuestion();

            fireEvent.click(screen.getByText('Regenbogen'));
            fireEvent.click(screen.getByText('Regenbogen'));

            expect(buttonOf('Regenbogen')).toHaveStyle({ opacity: '0.5' });
            expect(buttonOf(SAVE).disabled).toBe(true);
        });

        it.each(['Enter', ' '])('selects an option with the "%s" key', (key) => {
            renderQuestion();

            fireEvent.keyDown(buttonOf('Kuhmuh'), { key });

            expect(buttonOf('Kuhmuh')).toHaveStyle({ opacity: '1' });
        });

        it('submits all selected options', async () => {
            loginAsTeam({ teamId: 4 });
            backend.post(ANSWER_URL, makeAnswer());
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Bowsers Festung'));
            fireEvent.click(screen.getByText('Regenbogen'));
            fireEvent.click(screen.getByText(SAVE));

            await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: ANSWER_URL,
                body: {
                    questionId: 7,
                    answerType: 'CHECKBOX',
                    freeTextAnswer: '',
                    multipleChoiceSelectedOption: -1,
                    checkboxSelectedOptions: [2, 0],
                    teamSelectedOption: -1,
                },
            }]);
        });

        it.each(['Enter', ' '])('submits with the "%s" key', async (key) => {
            backend.post(ANSWER_URL, makeAnswer());
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Kuhmuh'));
            fireEvent.keyDown(buttonOf(SAVE), { key });

            await waitFor(() => expect(toggleAccordion).toHaveBeenCalledTimes(1));
        });

        it('locks the question after the answer was saved', async () => {
            backend.post(ANSWER_URL, makeAnswer());
            const { container } = renderQuestion();

            fireEvent.click(screen.getByText('Kuhmuh'));
            fireEvent.click(screen.getByText(SAVE));

            await waitFor(() => expect(screen.queryByText(SAVE)).not.toBeInTheDocument());
            expect(statusIcon(container).icon).toBe(checkmarkCircleOutline);
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Kuhmuh').disabled).toBe(false);
            expect(buttonOf('Regenbogen').disabled).toBe(true);
        });

        it('shows the error and stays open when the answer is rejected', async () => {
            backend.fail('POST', ANSWER_URL, 409);
            const { toggleAccordion } = renderQuestion();

            fireEvent.click(screen.getByText('Kuhmuh'));
            fireEvent.click(screen.getByText(SAVE));

            await expectErrorToast('Frage kann nicht beantwortet werden');
            expect(toggleAccordion).not.toHaveBeenCalled();
            expect(screen.getByText(SAVE)).toBeInTheDocument();
        });
    });

    describe('an open question that was already answered', () => {
        it('shows a checkmark and the chosen option as selected', async () => {
            markAsAnswered('1');

            const { container } = renderQuestion();

            await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Kuhmuh')).toHaveStyle({ opacity: '1' });
            expect(buttonOf('Regenbogen')).toHaveStyle({ opacity: '0.5' });
            expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
        });

        it('shows every chosen option of a comma separated answer as selected', async () => {
            markAsAnswered('0,2');

            const { container } = renderQuestion();

            await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));
            expect(buttonOf('Regenbogen')).toHaveStyle({ opacity: '1' });
            expect(buttonOf('Kuhmuh')).toHaveStyle({ opacity: '0.5' });
            expect(buttonOf('Bowsers Festung')).toHaveStyle({ opacity: '1' });
        });

        it('ignores clicks on the options', async () => {
            markAsAnswered('1');
            const { container } = renderQuestion();
            await waitFor(() => expect(statusIcon(container).icon).toBe(checkmarkCircleOutline));

            fireEvent.click(screen.getByText('Regenbogen'));

            expect(buttonOf('Regenbogen')).toHaveStyle({ opacity: '0.5' });
        });
    });

    describe('a closed question', () => {
        it('shows the share of votes per option and a statistics icon', async () => {
            backend.get('/public/survey/7/statistics', [6, 3, 1]);

            const { container } = renderQuestion({ active: false });

            await waitFor(() => expect(buttonOf('Regenbogen')).toHaveTextContent('60%'));
            expect(buttonOf('Kuhmuh')).toHaveTextContent('30%');
            expect(buttonOf('Bowsers Festung')).toHaveTextContent('10%');
            expect(statusIcon(container).icon).toBe(statsChartOutline);
        });

        it('cannot be answered', async () => {
            backend.get('/public/survey/7/statistics', [6, 3, 1]);

            const { container } = renderQuestion({ active: false });

            await waitFor(() => expect(buttonOf('Regenbogen')).toHaveTextContent('60%'));
            expect(screen.queryByText(SAVE)).not.toBeInTheDocument();
            expect(header(container).disabled).toBe(true);
            expect(buttonOf('Regenbogen')).toHaveStyle({ pointerEvents: 'none' });
        });

        it('reloads the results when the header is activated', async () => {
            backend.get('/public/survey/7/statistics', [6, 3, 1]);
            const { container } = renderQuestion({ active: false });
            await waitFor(() => expect(buttonOf('Regenbogen')).toHaveTextContent('60%'));

            backend.get('/public/survey/7/statistics', [1, 1, 2]);
            fireEvent.keyDown(header(container), { key: 'Enter' });

            await waitFor(() => expect(buttonOf('Bowsers Festung')).toHaveTextContent('50%'));
        });
    });
});
