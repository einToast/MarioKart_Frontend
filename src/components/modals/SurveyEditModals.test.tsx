import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { makeQuestion } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { QuestionReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import SurveyAddModal from './SurveyAddModal';
import SurveyChangeModal from './SurveyChangeModal';
import SurveyDeleteModal from './SurveyDeleteModal';

const questionInput = () => screen.getByPlaceholderText('Frage eingeben');
const optionInputs = () => screen.queryAllByPlaceholderText(/^Option \d+ eingeben$/) as HTMLInputElement[];
const fill = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });
// The modals contain several selects; they are addressed through the label next to them
const selectBelow = (label: string) => (screen.getByText(label).parentElement as HTMLElement).querySelector('select') as HTMLSelectElement;

describe('SurveyAddModal', () => {
    const SAVE = 'Umfrage speichern';

    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<SurveyAddModal showModal={showModal} closeModal={closeModal} />);
        return { ...view, closeModal };
    };

    const chooseType = (type: QuestionType) => fill(selectBelow('Abstimmungsoptionen'), type);

    it('stays hidden while closed', () => {
        renderModal(false);

        expect(screen.queryByText('Neue Abstimmung')).not.toBeInTheDocument();
    });

    it('starts as an empty multiple choice question with four options', () => {
        renderModal();

        expect(questionInput()).toHaveValue('');
        expect(selectBelow('Abstimmungsoptionen')).toHaveValue('MULTIPLE_CHOICE');
        expect(optionInputs().map(input => input.value)).toEqual(['', '', '', '']);
        expect(selectBelow('Antworten pro Gerät')).toHaveValue('false');
    });

    it('offers every question type', () => {
        renderModal();

        expect(Array.from(selectBelow('Abstimmungsoptionen').options).map(option => option.value)).toEqual([
            'MULTIPLE_CHOICE', 'FREE_TEXT', 'CHECKBOX', 'TEAM', 'TEAM_ONE_FREE_TEXT',
        ]);
    });

    it('adds and removes option inputs', () => {
        renderModal();

        fireEvent.click(screen.getByText('Option hinzufügen'));
        expect(optionInputs()).toHaveLength(5);

        fireEvent.click(screen.getByText('Option entfernen'));
        fireEvent.click(screen.getByText('Option entfernen'));
        expect(optionInputs()).toHaveLength(3);
    });

    it.each(['Enter', ' '])('adds and removes option inputs with the "%s" key', (key) => {
        renderModal();

        fireEvent.keyDown(buttonOf('Option hinzufügen'), { key });
        expect(optionInputs()).toHaveLength(5);

        fireEvent.keyDown(buttonOf('Option entfernen'), { key });
        expect(optionInputs()).toHaveLength(4);
    });

    it('does not remove more options than there are', () => {
        renderModal();

        for (let i = 0; i < 6; i++) {
            fireEvent.click(screen.getByText('Option entfernen'));
        }

        expect(optionInputs()).toHaveLength(0);
    });

    it.each([QuestionType.FREE_TEXT, QuestionType.TEAM, QuestionType.TEAM_ONE_FREE_TEXT])('hides the options for %s questions', (type) => {
        renderModal();

        chooseType(type);

        expect(optionInputs()).toHaveLength(0);
        expect(screen.queryByText('Option hinzufügen')).not.toBeInTheDocument();
    });

    it('keeps the options for checkbox questions', () => {
        renderModal();

        chooseType(QuestionType.CHECKBOX);

        expect(optionInputs()).toHaveLength(4);
    });

    it('offers the team selection only for team questions', () => {
        renderModal();
        expect(screen.queryByText('Teamauswahl')).not.toBeInTheDocument();

        chooseType(QuestionType.TEAM);

        expect(selectBelow('Teamauswahl')).toHaveValue('false');
    });

    it('creates the question with the entered options', async () => {
        backend.post('/admin/survey', makeQuestion());
        const { closeModal } = renderModal();

        fill(questionInput(), 'Wer gewinnt?');
        fireEvent.click(screen.getByText('Option entfernen'));
        fireEvent.click(screen.getByText('Option entfernen'));
        fill(optionInputs()[0], 'Mario');
        fill(optionInputs()[1], 'Luigi');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(closeModal).toHaveBeenLastCalledWith({ surveyCreated: true }));
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
                finalTeamsOnly: false,
                oneAnswerPerKey: false,
            },
        }]);
    });

    it('creates a team question restricted to final teams with one answer per key', async () => {
        backend.post('/admin/survey', makeQuestion());
        const { closeModal } = renderModal();

        fill(questionInput(), 'Wer gewinnt das Finale?');
        chooseType(QuestionType.TEAM);
        fill(selectBelow('Teamauswahl'), 'true');
        fill(selectBelow('Antworten pro Gerät'), 'true');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(closeModal).toHaveBeenLastCalledWith({ surveyCreated: true }));
        expect(backend.requests[0].body).toMatchObject({
            questionText: 'Wer gewinnt das Finale?',
            questionType: 'TEAM',
            finalTeamsOnly: true,
            oneAnswerPerKey: true,
        });
    });

    it.each(['Enter', ' '])('creates the question with the "%s" key', async (key) => {
        backend.post('/admin/survey', makeQuestion());
        const { closeModal } = renderModal();

        fill(questionInput(), 'Feedback?');
        chooseType(QuestionType.FREE_TEXT);
        fireEvent.keyDown(buttonOf(SAVE), { key });

        await waitFor(() => expect(closeModal).toHaveBeenLastCalledWith({ surveyCreated: true }));
    });

    it('resets the form after the question was created', async () => {
        backend.post('/admin/survey', makeQuestion());
        const { closeModal } = renderModal();

        fill(questionInput(), 'Feedback?');
        chooseType(QuestionType.FREE_TEXT);
        fill(selectBelow('Antworten pro Gerät'), 'true');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(closeModal).toHaveBeenLastCalledWith({ surveyCreated: true }));
        expect(questionInput()).toHaveValue('');
        expect(selectBelow('Abstimmungsoptionen')).toHaveValue('MULTIPLE_CHOICE');
        expect(optionInputs()).toHaveLength(4);
        expect(selectBelow('Antworten pro Gerät')).toHaveValue('false');
    });

    it('shows the validation error and stays open when the question text is missing', async () => {
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Die Frage darf nicht leer sein');
        expect(closeModal).not.toHaveBeenCalled();
        expect(backend.requests).toEqual([]);
    });

    it('shows the validation error when an option is left empty', async () => {
        renderModal();

        fill(questionInput(), 'Wer gewinnt?');
        fill(optionInputs()[0], 'Mario');
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Alle Optionen müssen ausgefüllt sein');
        expect(backend.requests).toEqual([]);
    });

    it('shows the error and keeps the input when the backend rejects the question', async () => {
        backend.fail('POST', '/admin/survey', 401);
        const { closeModal } = renderModal();

        fill(questionInput(), 'Feedback?');
        chooseType(QuestionType.FREE_TEXT);
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Nicht autorisierter Zugriff');
        expect(closeModal).not.toHaveBeenCalled();
        expect(questionInput()).toHaveValue('Feedback?');
    });

    it('reports an error when the backend answers without the created question', async () => {
        backend.post('/admin/survey', undefined);
        renderModal();

        fill(questionInput(), 'Feedback?');
        chooseType(QuestionType.FREE_TEXT);
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Umfrage konnte nicht erstellt werden');
    });

    it('discards the input and closes on cancel', () => {
        const { closeModal } = renderModal();
        fill(questionInput(), 'Wer gewinnt?');

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ surveyCreated: false });
        expect(questionInput()).toHaveValue('');
        expect(backend.requests).toEqual([]);
    });
});

describe('SurveyChangeModal', () => {
    const CHANGE = 'Umfrage ändern';

    const question = (overrides: Partial<QuestionReturnDTO> = {}) =>
        makeQuestion({ id: 7, questionText: 'Wer gewinnt?', options: ['Mario', 'Luigi', 'Peach'], active: true, visible: true, live: false, ...overrides });

    const renderModal = (overrides: Partial<QuestionReturnDTO> = {}, showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<SurveyChangeModal showModal={showModal} closeModal={closeModal} question={question(overrides)} />);
        return { ...view, closeModal };
    };

    it('stays hidden while closed', () => {
        renderModal({}, false);

        expect(screen.queryByPlaceholderText('Frage eingeben')).not.toBeInTheDocument();
    });

    it('is prefilled with the question', () => {
        renderModal({ oneAnswerPerKey: true });

        expect(questionInput()).toHaveValue('Wer gewinnt?');
        expect(optionInputs().map(input => input.value)).toEqual(['Mario', 'Luigi', 'Peach']);
        expect(selectBelow('Abstimmungsoptionen')).toHaveValue('MULTIPLE_CHOICE');
        expect(selectBelow('Antworten pro Gerät')).toHaveValue('true');
    });

    it('does not allow changing the question type', () => {
        renderModal();

        expect(selectBelow('Abstimmungsoptionen')).toBeDisabled();
    });

    it('shows the team selection of a team question read-only', () => {
        renderModal({ questionType: QuestionType.TEAM, finalTeamsOnly: true });

        expect(selectBelow('Teamauswahl')).toHaveValue('true');
        expect(selectBelow('Teamauswahl')).toBeDisabled();
        expect(optionInputs()).toHaveLength(0);
    });

    it.each([QuestionType.FREE_TEXT, QuestionType.TEAM_ONE_FREE_TEXT])('shows no options for %s questions', (questionType) => {
        renderModal({ questionType, options: [] });

        expect(optionInputs()).toHaveLength(0);
        expect(screen.queryByText('Option hinzufügen')).not.toBeInTheDocument();
    });

    it('saves the edited text, options and key setting while keeping the survey state', async () => {
        backend.put('/admin/survey/7', question());
        const { closeModal } = renderModal();

        fill(questionInput(), 'Wer gewinnt das Finale?');
        fill(optionInputs()[2], 'Toad');
        fireEvent.click(screen.getByText('Option hinzufügen'));
        fill(optionInputs()[3], 'Yoshi');
        fill(selectBelow('Antworten pro Gerät'), 'true');
        fireEvent.click(screen.getByText(CHANGE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ surveyChanged: true }));
        expect(backend.requests).toEqual([{
            method: 'PUT',
            url: '/admin/survey/7',
            body: {
                questionText: 'Wer gewinnt das Finale?',
                questionType: 'MULTIPLE_CHOICE',
                options: ['Mario', 'Luigi', 'Toad', 'Yoshi'],
                active: true,
                visible: true,
                live: false,
                finalTeamsOnly: false,
                oneAnswerPerKey: true,
            },
        }]);
    });

    it('removes the last option', async () => {
        backend.put('/admin/survey/7', question());
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText('Option entfernen'));
        fireEvent.click(screen.getByText(CHANGE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ surveyChanged: true }));
        expect(backend.requests[0].body).toMatchObject({ options: ['Mario', 'Luigi'] });
    });

    it.each(['Enter', ' '])('saves with the "%s" key', async (key) => {
        backend.put('/admin/survey/7', question());
        const { closeModal } = renderModal();

        fireEvent.keyDown(buttonOf(CHANGE), { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ surveyChanged: true }));
    });

    it('shows the validation error and stays open when an option is emptied', async () => {
        const { closeModal } = renderModal();

        fill(optionInputs()[1], '');
        fireEvent.click(screen.getByText(CHANGE));

        await expectErrorToast('Alle Optionen müssen ausgefüllt sein');
        expect(closeModal).not.toHaveBeenCalled();
        expect(backend.requests).toEqual([]);
    });

    it('shows the error and stays open when the backend rejects the change', async () => {
        backend.fail('PUT', '/admin/survey/7', 404);
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText(CHANGE));

        await expectErrorToast('Frage nicht gefunden');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('reports an error when the backend answers without the updated question', async () => {
        backend.put('/admin/survey/7', undefined);
        renderModal();

        fireEvent.click(screen.getByText(CHANGE));

        await expectErrorToast('Umfrage konnte nicht aktualisiert werden');
    });

    it('closes without saving on cancel', () => {
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ surveyChanged: false });
        expect(backend.requests).toEqual([]);
    });

    it('loads the question that is selected when the modal opens', () => {
        const closeModal = vi.fn();
        const { rerender } = render(<SurveyChangeModal showModal={false} closeModal={closeModal} question={question()} />);

        rerender(<SurveyChangeModal showModal={true} closeModal={closeModal} question={question({ id: 8, questionText: 'Beste Strecke?', options: ['Regenbogen', 'Kuhmuh'] })} />);

        expect(questionInput()).toHaveValue('Beste Strecke?');
        expect(optionInputs().map(input => input.value)).toEqual(['Regenbogen', 'Kuhmuh']);
    });
});

describe('SurveyDeleteModal', () => {
    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<SurveyDeleteModal showModal={showModal} closeModal={closeModal} question={makeQuestion({ id: 7, questionText: 'Wer gewinnt?' })} />);
        return { ...view, closeModal };
    };

    // "Umfrage löschen" is both the title and the button label; this is the button
    const deleteButton = () => screen.getByText('Umfrage löschen', { selector: 'p' });

    it('stays hidden while closed', () => {
        renderModal(false);

        expect(screen.queryByText(/wirklich löschen/)).not.toBeInTheDocument();
    });

    it('asks for confirmation and names the survey', () => {
        renderModal();

        expect(screen.getByText(/wirklich löschen/)).toHaveTextContent('Willst du die Umfrage Wer gewinnt? wirklich löschen?');
        expect(screen.getByText('Diese Aktion kann nicht rückgängig gemacht werden.')).toBeInTheDocument();
    });

    it('deletes the survey and reports the deletion', async () => {
        backend.delete('/admin/survey/7');
        const { closeModal } = renderModal();

        fireEvent.click(deleteButton());

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ surveyDeleted: true }));
        expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/survey/7', body: undefined }]);
    });

    it.each(['Enter', ' '])('deletes with the "%s" key', async (key) => {
        backend.delete('/admin/survey/7');
        const { closeModal } = renderModal();

        fireEvent.keyDown(deleteButton().closest('ion-button') as Element, { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ surveyDeleted: true }));
    });

    it('shows the error and stays open when the survey cannot be deleted', async () => {
        backend.fail('DELETE', '/admin/survey/7', 401);
        const { closeModal } = renderModal();

        fireEvent.click(deleteButton());

        await expectErrorToast('Nicht autorisierter Zugriff');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('closes without deleting on cancel', () => {
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ surveyDeleted: false });
        expect(backend.requests).toEqual([]);
    });
});
