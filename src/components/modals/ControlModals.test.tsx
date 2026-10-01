import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { makeBreak, makeQuestion, makeRound, makeTeams } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import { BreakReturnDTO } from '../../util/api/config/dto';
import { ChangeType } from '../../util/service/util';
import BreakChangeModal from './BreakChangeModal';
import NotificationModal from './NotificationModal';
import TournamentModal from './TournamentModal';

const fill = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });
const selectBelow = (label: string) => (screen.getByText(label).parentElement as HTMLElement).querySelector('select') as HTMLSelectElement;

describe('BreakChangeModal', () => {
    const CHANGE = 'Pause ändern';
    const ROUNDS_URL = '/admin/schedule/rounds';
    const BREAK_URL = '/admin/schedule/break';

    const aBreak = (overrides: Partial<BreakReturnDTO> = {}) => makeBreak({
        startTime: '2025-01-08T18:30:00',
        endTime: '2025-01-08T19:15:00',
        breakEnded: false,
        round: makeRound({ id: 60, roundNumber: 6 }),
        ...overrides,
    });

    const renderModal = (overrides: Partial<BreakReturnDTO> = {}, showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<BreakChangeModal showModal={showModal} closeModal={closeModal} aBreak={aBreak(overrides)} />);
        return { ...view, closeModal };
    };

    const durationInput = () => screen.getByPlaceholderText('Dauer der Pause');
    const roundOptions = () => Array.from(selectBelow('Vor Runde').options).map(option => option.textContent);

    beforeEach(() => {
        backend.get(ROUNDS_URL, [
            makeRound({ id: 50, roundNumber: 5 }),
            makeRound({ id: 60, roundNumber: 6 }),
            makeRound({ id: 70, roundNumber: 7 }),
        ]);
    });

    it('stays hidden and loads nothing while closed', () => {
        renderModal({}, false);

        expect(screen.queryByPlaceholderText('Dauer der Pause')).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it('shows the duration in minutes, the round the break precedes and whether it has ended', async () => {
        renderModal();

        await waitFor(() => expect(roundOptions()).toEqual(['5', '6', '7']));
        expect(durationInput()).toHaveValue(45);
        expect(selectBelow('Vor Runde')).toHaveValue('60');
        expect(selectBelow('Pause beendet')).toHaveValue('0');
    });

    it('shows a break that has ended', async () => {
        renderModal({ breakEnded: true });

        await waitFor(() => expect(roundOptions()).toHaveLength(3));
        expect(selectBelow('Pause beendet')).toHaveValue('1');
    });

    it('saves the edited break and reports the change', async () => {
        backend.put(BREAK_URL, aBreak());
        const { closeModal } = renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fill(durationInput(), '20');
        fill(selectBelow('Vor Runde'), '70');
        fill(selectBelow('Pause beendet'), '1');
        fireEvent.click(screen.getByText(CHANGE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ breakChanged: true }));
        expect(backend.requestsTo('PUT', BREAK_URL)).toEqual([{
            method: 'PUT',
            url: BREAK_URL,
            body: { roundId: 70, breakDuration: 20, breakEnded: true },
        }]);
    });

    it('saves the unchanged values when nothing was edited', async () => {
        backend.put(BREAK_URL, aBreak());
        const { closeModal } = renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fireEvent.click(screen.getByText(CHANGE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ breakChanged: true }));
        expect(backend.requestsTo('PUT', BREAK_URL)[0].body).toEqual({ roundId: 60, breakDuration: 45, breakEnded: false });
    });

    it.each(['Enter', ' '])('saves with the "%s" key', async (key) => {
        backend.put(BREAK_URL, aBreak());
        const { closeModal } = renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fireEvent.keyDown(buttonOf(CHANGE), { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ breakChanged: true }));
    });

    it('shows the error and stays open when the break cannot be saved', async () => {
        backend.fail('PUT', BREAK_URL, 404);
        const { closeModal } = renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fireEvent.click(screen.getByText(CHANGE));

        await expectErrorToast('Pause nicht gefunden');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('reports an error when the backend answers without the updated break', async () => {
        backend.put(BREAK_URL, undefined);
        renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fireEvent.click(screen.getByText(CHANGE));

        await expectErrorToast('Pause konnte nicht geändert werden');
    });

    it('shows an error when the rounds cannot be loaded', async () => {
        backend.fail('GET', ROUNDS_URL, 401);

        renderModal();

        await expectErrorToast('Nicht autorisierter Zugriff');
    });

    it('closes without saving on cancel', async () => {
        const { closeModal } = renderModal();
        await waitFor(() => expect(roundOptions()).toHaveLength(3));

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ breakChanged: false });
        expect(backend.requestsTo('PUT', BREAK_URL)).toEqual([]);
    });
});

describe('NotificationModal', () => {
    const SEND = 'Benachrichtigung senden';

    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<NotificationModal showModal={showModal} closeModal={closeModal} teams={makeTeams()} />);
        return { ...view, closeModal };
    };

    /** "Benachrichtigung senden" is both the title and the button label; this is the button. */
    const sendButton = () => screen.getByText(SEND, { selector: 'p' });
    const titleInput = () => screen.getByPlaceholderText('Titel eingeben');
    const messageInput = () => screen.getByPlaceholderText('Nachricht eingeben');

    it('stays hidden while closed', () => {
        renderModal(false);

        expect(screen.queryByPlaceholderText('Titel eingeben')).not.toBeInTheDocument();
    });

    it('offers all teams as recipients, preselecting everyone', () => {
        renderModal();

        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
            'Alle', 'Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad',
        ]);
        expect(screen.getByRole('combobox')).toHaveValue('-1');
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows the character of the selected team', () => {
        renderModal();

        fill(screen.getByRole('combobox'), '3');

        expect(screen.getByAltText('Peach character')).toHaveAttribute('src', '/characters/Peach.png');
    });

    it('sends the notification to everyone and reports it', async () => {
        backend.post('/admin/notification/send');
        const { closeModal } = renderModal();

        fill(titleInput(), 'Pause');
        fill(messageInput(), 'Pizza ist da');
        fireEvent.click(sendButton());

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ notificationSent: true }));
        expect(backend.requests).toEqual([{
            method: 'POST',
            url: '/admin/notification/send',
            body: { title: 'Pause', message: 'Pizza ist da' },
        }]);
    });

    it('sends the notification to the selected team only', async () => {
        backend.post('/admin/notification/send/3');
        const { closeModal } = renderModal();

        fill(screen.getByRole('combobox'), '3');
        fill(titleInput(), 'Runde 3');
        fill(messageInput(), 'Ihr seid dran');
        fireEvent.click(sendButton());

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ notificationSent: true }));
        expect(backend.requests).toEqual([{
            method: 'POST',
            url: '/admin/notification/send/3',
            body: { title: 'Runde 3', message: 'Ihr seid dran' },
        }]);
    });

    it.each(['Enter', ' '])('sends with the "%s" key', async (key) => {
        backend.post('/admin/notification/send');
        const { closeModal } = renderModal();

        fireEvent.keyDown(sendButton().closest('ion-button') as Element, { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ notificationSent: true }));
    });

    it('clears title and message after sending', async () => {
        backend.post('/admin/notification/send');
        const { closeModal } = renderModal();

        fill(titleInput(), 'Pause');
        fill(messageInput(), 'Pizza ist da');
        fireEvent.click(sendButton());

        await waitFor(() => expect(closeModal).toHaveBeenCalled());
        expect(titleInput()).toHaveValue('');
        expect(messageInput()).toHaveValue('');
    });

    it('shows the error and keeps the input when sending fails', async () => {
        backend.fail('POST', '/admin/notification/send', 500);
        const { closeModal } = renderModal();

        fill(titleInput(), 'Pause');
        fireEvent.click(sendButton());

        await expectErrorToast('Benachrichtigung konnte nicht gesendet werden');
        expect(closeModal).not.toHaveBeenCalled();
        expect(titleInput()).toHaveValue('Pause');
    });

    it('closes without sending on cancel', () => {
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ notificationSent: false });
        expect(backend.requests).toEqual([]);
    });
});

describe('TournamentModal', () => {
    /**
     * Opens the modal the way Control.tsx does: it is mounted closed, loads the settings and is
     * opened afterwards.
     */
    const openModal = async (changeType: ChangeType, settings = { tournamentOpen: true, registrationOpen: true }) => {
        backend.get('/public/settings', settings);
        const closeModal = vi.fn();
        const view = render(<TournamentModal showModal={false} closeModal={closeModal} changeType={changeType} />);
        await waitFor(() => expect(backend.requestsTo('GET', '/public/settings')).toHaveLength(2));
        view.rerender(<TournamentModal showModal={true} closeModal={closeModal} changeType={changeType} />);
        return { ...view, closeModal };
    };

    const title = () => screen.getByRole('heading', { level: 4 });
    /** The confirm button repeats the title; this is the button. */
    const confirmButton = (label: string) => screen.getByText(label, { selector: 'p' }).closest('ion-button') as HTMLElement;
    const question = () => screen.getByText(/Willst du wirklich/);
    const IRREVERSIBLE = 'Diese Aktion kann nicht rückgängig gemacht werden.';

    it('stays hidden while closed', () => {
        backend.get('/public/settings', {});

        render(<TournamentModal showModal={false} closeModal={vi.fn()} changeType={ChangeType.ALL} />);

        expect(screen.queryByText(/Willst du wirklich/)).not.toBeInTheDocument();
    });

    it.each([
        [ChangeType.SURVEYS, 'Umfragen löschen', 'Willst du wirklich alle Umfragen löschen?'],
        [ChangeType.TEAMS, 'Teams löschen', 'Willst du wirklich alle Teams löschen?'],
        [ChangeType.SCHEDULE, 'Spielplan löschen', 'Willst du wirklich den Spielplan löschen?'],
        [ChangeType.FINAL_SCHEDULE, 'Finalspiele löschen', 'Willst du wirklich die Finalspiele löschen?'],
        [ChangeType.ALL, 'Anwendung zurücksetzen', 'Willst du wirklich ALLES zurücksetzen?'],
    ])('asks for confirmation before the irreversible change "%s"', async (changeType, expectedTitle, expectedQuestion) => {
        await openModal(changeType);

        expect(title()).toHaveTextContent(expectedTitle);
        expect(question()).toHaveTextContent(expectedQuestion);
        expect(screen.getByText(IRREVERSIBLE)).toBeInTheDocument();
    });

    it.each([
        [true, 'Turnier schließen', 'Willst du wirklich das Turnier schließen?'],
        [false, 'Turnier öffnen', 'Willst du wirklich das Turnier öffnen?'],
    ])('offers the opposite of the current state for a tournament that is open=%s', async (tournamentOpen, expectedTitle, expectedQuestion) => {
        await openModal(ChangeType.TOURNAMENT, { tournamentOpen, registrationOpen: !tournamentOpen });

        expect(title()).toHaveTextContent(expectedTitle);
        expect(question()).toHaveTextContent(expectedQuestion);
        expect(screen.queryByText(IRREVERSIBLE)).not.toBeInTheDocument();
    });

    it.each([
        [true, 'Registrierung schließen', 'Willst du wirklich die Registrierung schließen?'],
        [false, 'Registrierung öffnen', 'Willst du wirklich die Registrierung öffnen?'],
    ])('offers the opposite of the current state for a registration that is open=%s', async (registrationOpen, expectedTitle, expectedQuestion) => {
        await openModal(ChangeType.REGISTRATION, { tournamentOpen: !registrationOpen, registrationOpen });

        expect(title()).toHaveTextContent(expectedTitle);
        expect(question()).toHaveTextContent(expectedQuestion);
        expect(screen.queryByText(IRREVERSIBLE)).not.toBeInTheDocument();
    });

    it('performs the change on confirmation and reports which one', async () => {
        backend.delete('/admin/teams');
        const { closeModal } = await openModal(ChangeType.TEAMS);

        fireEvent.click(confirmButton('Teams löschen'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith(ChangeType.TEAMS));
        expect(backend.requestsTo('DELETE', '/admin/teams')).toHaveLength(1);
    });

    it('closes the open tournament on confirmation', async () => {
        backend.put('/admin/settings', {});
        const { closeModal } = await openModal(ChangeType.TOURNAMENT);

        fireEvent.click(confirmButton('Turnier schließen'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith(ChangeType.TOURNAMENT));
        expect(backend.requestsTo('PUT', '/admin/settings')[0].body).toEqual({ tournamentOpen: false });
    });

    it('deletes every survey on confirmation', async () => {
        backend.get('/admin/survey', [makeQuestion({ id: 1 }), makeQuestion({ id: 2 })]).delete(/^\/admin\/survey\/\d+$/);
        const { closeModal } = await openModal(ChangeType.SURVEYS);

        fireEvent.click(confirmButton('Umfragen löschen'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith(ChangeType.SURVEYS));
        expect(backend.requests.filter(request => request.method === 'DELETE').map(request => request.url))
            .toEqual(['/admin/survey/1', '/admin/survey/2']);
    });

    it.each(['Enter', ' '])('confirms with the "%s" key', async (key) => {
        backend.delete('/admin/settings/reset');
        const { closeModal } = await openModal(ChangeType.ALL);

        fireEvent.keyDown(confirmButton('Anwendung zurücksetzen'), { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith(ChangeType.ALL));
    });

    it('shows the error and stays open when the change fails', async () => {
        backend.fail('DELETE', '/admin/teams', 409);
        const { closeModal } = await openModal(ChangeType.TEAMS);

        fireEvent.click(confirmButton('Teams löschen'));

        await expectErrorToast('Spielplan wurde bereits erstellt');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('shows an error when the settings cannot be loaded', async () => {
        backend.fail('GET', '/public/settings', 500);

        render(<TournamentModal showModal={true} closeModal={vi.fn()} changeType={ChangeType.TOURNAMENT} />);

        await expectErrorToast('Einstellungen konnten nicht geladen werden');
    });

    it('closes without changing anything on cancel', async () => {
        const { closeModal } = await openModal(ChangeType.ALL);

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith();
        expect(backend.requests.filter(request => request.method !== 'GET')).toEqual([]);
    });
});
