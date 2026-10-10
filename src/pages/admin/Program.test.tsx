import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend } from '../../test/backend';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { currentPath, renderWithRouter } from '../../test/render';
import { TournamentDTO } from '../../util/api/config/dto';
import { DEFAULT_PROGRAM, parseProgram, ProgramEntry, serializeProgram } from '../../util/layout/program';
import Program from './Program';

const SETTINGS_URL = '/public/settings';
const ADMIN_SETTINGS_URL = '/admin/settings';
const SAVE = 'Speichern';
const ADD = '+ Programmpunkt hinzufügen';

const renderPage = () => renderWithRouter(<Program />, { route: '/admin/program' });

const stubProgram = (entries: ProgramEntry[]) =>
    backend.get(SETTINGS_URL, { tournamentOpen: true, program: serializeProgram(entries) });
const texts = () => screen.queryAllByLabelText(/^Text von Programmpunkt/).map(input => (input as HTMLInputElement).value);
const times = () => screen.queryAllByLabelText(/^Zeit von Programmpunkt/).map(input => (input as HTMLInputElement).value);
const savedProgram = () => parseProgram((backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body as TournamentDTO).program);
const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const TWO_ENTRIES: ProgramEntry[] = [
    { icon: 'megaphone', time: '10:00', text: 'Begrüßung' },
    { icon: 'play', time: '10:15 - 12:00', text: 'Runden' },
];

describe('admin Program', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    itRequiresAnAdminSession(renderPage);

    it('starts from the default programme while none is stored', async () => {
        renderPage();

        await waitFor(() => expect(texts()).toEqual(DEFAULT_PROGRAM.map(entry => entry.text)));
        expect(times()).toEqual(DEFAULT_PROGRAM.map(entry => entry.time));
        expect(screen.getByLabelText('Symbol von Programmpunkt 3')).toHaveValue('pizza');
    });

    it('loads the stored programme', async () => {
        stubProgram(TWO_ENTRIES);

        renderPage();

        await waitFor(() => expect(texts()).toEqual(['Begrüßung', 'Runden']));
        expect(times()).toEqual(['10:00', '10:15 - 12:00']);
    });

    it('saves edited, added and reordered entries', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        stubProgram(TWO_ENTRIES);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(2));

        set('Text von Programmpunkt 1', ' Hallo ');
        set('Symbol von Programmpunkt 1', 'music');
        fireEvent.click(screen.getByText(ADD));
        set('Zeit von Programmpunkt 3', '13:00');
        set('Text von Programmpunkt 3', 'Finale');
        fireEvent.click(screen.getByLabelText('Programmpunkt 3 nach oben'));
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Programm gespeichert');
        expect(savedProgram()).toEqual([
            { icon: 'music', time: '10:00', text: 'Hallo' },
            { icon: 'time', time: '13:00', text: 'Finale' },
            { icon: 'play', time: '10:15 - 12:00', text: 'Runden' },
        ]);
        expect(texts()[0]).toBe('Hallo');
    });

    it('moves an entry down and does not move past the ends', async () => {
        stubProgram(TWO_ENTRIES);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(2));

        expect(screen.getByLabelText('Programmpunkt 1 nach oben')).toBeDisabled();
        expect(screen.getByLabelText('Programmpunkt 2 nach unten')).toBeDisabled();
        fireEvent.click(screen.getByLabelText('Programmpunkt 1 nach unten'));

        expect(texts()).toEqual(['Runden', 'Begrüßung']);
    });

    it('saves an empty programme, which hides it for the teams', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        stubProgram(TWO_ENTRIES);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(2));

        fireEvent.click(screen.getByLabelText('Programmpunkt 2 entfernen'));
        fireEvent.click(screen.getByLabelText('Programmpunkt 1 entfernen'));
        expect(screen.getByText('Keine Programmpunkte.')).toBeInTheDocument();
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Programm gespeichert');
        expect(savedProgram()).toEqual([]);
    });

    it('restores the default programme', async () => {
        stubProgram(TWO_ENTRIES);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(2));

        fireEvent.click(screen.getByText('Standard-Programm'));

        expect(texts()).toEqual(DEFAULT_PROGRAM.map(entry => entry.text));
    });

    it('requires a text for every entry', async () => {
        stubProgram(TWO_ENTRIES);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(2));

        fireEvent.click(screen.getByText(ADD));
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Jeder Programmpunkt braucht einen Text');
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)).toHaveLength(0);
    });

    it('stops offering new entries at thirty', async () => {
        stubProgram(Array.from({ length: 30 }, (_, index) => ({ icon: 'time' as const, time: '', text: `Punkt ${index}` })));

        renderPage();

        await waitFor(() => expect(texts()).toHaveLength(30));
        expect(screen.getByText(ADD)).toBeDisabled();
    });

    it('shows the error when saving fails', async () => {
        backend.fail('PUT', ADMIN_SETTINGS_URL, 400);
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(6));

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Ungültige Einstellungen');
    });

    it('shows an error when the settings cannot be loaded', async () => {
        backend.fail('GET', SETTINGS_URL, 500);

        renderPage();

        await expectErrorToast('Einstellungen konnten nicht geladen werden');
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await waitFor(() => expect(texts()).toHaveLength(6));

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});
