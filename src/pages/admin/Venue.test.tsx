import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend } from '../../test/backend';
import { makeSwitches } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { currentPath, renderWithRouter } from '../../test/render';
import { TournamentDTO } from '../../util/api/config/dto';
import { createDefaultFloorPlan, createElement, isDefaultFloorPlan, parseFloorPlan, serializeFloorPlan } from '../../util/layout/floorPlan';
import Venue from './Venue';

const SETTINGS_URL = '/public/settings';
const ADMIN_SETTINGS_URL = '/admin/settings';
const SAVE = 'Speichern';

const renderPage = () => renderWithRouter(<Venue />, { route: '/admin/venue' });

const stubSettings = (settings: TournamentDTO) => backend.get(SETTINGS_URL, { tournamentOpen: true, ...settings });
const names = () => screen.queryAllByLabelText(/^Name der Switch/).map(input => (input as HTMLInputElement).value);
const markers = () => screen.queryAllByRole('button', { name: /^Switch / }).map(marker => marker.getAttribute('aria-label'));
const savedSettings = () => backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body as TournamentDTO;

describe('admin Venue', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    itRequiresAnAdminSession(renderPage);

    it('lists the configured switches and draws a default plan while none is stored', async () => {
        renderPage();

        await waitFor(() => expect(names()).toEqual(['Blau', 'Rot', 'Grün', 'Weiß']));
        expect(markers()).toEqual(['Switch Blau', 'Switch Rot', 'Switch Grün', 'Switch Weiß']);
        // The classic room: a screen per switch and the counter
        expect(screen.getAllByRole('button', { name: 'Tisch' })).toHaveLength(5);
    });

    it('explains the numbering while no switch is configured', async () => {
        stubSettings({ switches: [] });

        renderPage();

        expect(await screen.findByText('Noch keine Switches eingerichtet. Bis dahin werden sie durchnummeriert.')).toBeInTheDocument();
        expect(markers()).toEqual([]);
    });

    it('loads the stored plan and gives switches without a marker one', async () => {
        const plan = createDefaultFloorPlan(1);
        plan.elements.push(createElement(plan, 'text', { text: 'Pizza' }));
        stubSettings({ switches: makeSwitches().slice(0, 2), floorPlan: serializeFloorPlan(plan) });

        renderPage();

        expect(await screen.findByRole('button', { name: 'Text Pizza' })).toBeInTheDocument();
        expect(markers()).toEqual(['Switch Blau', 'Switch Rot']);
        // The edited plan keeps its furniture, only the marker of the second switch is added
        expect(screen.getAllByRole('button', { name: 'Tisch' })).toHaveLength(2);
    });

    it('adds switches from the palette and puts them on the plan', async () => {
        stubSettings({ switches: [] });
        renderPage();
        await screen.findByText('+ Switch hinzufügen');

        fireEvent.click(screen.getByText('+ Switch hinzufügen'));
        fireEvent.click(screen.getByText('+ Switch hinzufügen'));

        expect(names()).toEqual(['Blau', 'Rot']);
        expect(markers()).toEqual(['Switch Blau', 'Switch Rot']);
    });

    it('lets an untouched default plan follow the number of switches', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

        fireEvent.click(screen.getByText('Entfernen'));
        fireEvent.click(screen.getByText('Entfernen'));
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Switches und Raumplan gespeichert');
        expect(isDefaultFloorPlan(parseFloorPlan(savedSettings().floorPlan)!, 2)).toBe(true);
    });

    it('keeps the furniture of an edited plan when the number of switches changes', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

        fireEvent.click(screen.getByText('+ Tisch'));
        fireEvent.click(screen.getAllByText('Entfernen')[0]);

        expect(names()).toHaveLength(3);
        expect(screen.getAllByRole('button', { name: 'Tisch' })).toHaveLength(6);
    });

    it('removes only the last switch, together with its marker', async () => {
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

        expect(screen.getAllByText('Entfernen')).toHaveLength(1);
        fireEvent.click(screen.getByText('Entfernen'));

        expect(names()).toEqual(['Blau', 'Rot', 'Grün']);
        expect(markers()).toEqual(['Switch Blau', 'Switch Rot', 'Switch Grün']);
    });

    it('stops offering new switches at sixteen', async () => {
        stubSettings({ switches: Array.from({ length: 16 }, (_, index) => ({ name: `S${index}`, color: '#9DAEDA' })) });

        renderPage();

        await waitFor(() => expect(names()).toHaveLength(16));
        expect(screen.getByText('+ Switch hinzufügen')).toBeDisabled();
    });

    it('saves renamed and recoloured switches together with the plan', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

        fireEvent.change(screen.getByLabelText('Name der Switch 1'), { target: { value: ' Bühne ' } });
        fireEvent.change(screen.getByLabelText('Farbe der Switch 2'), { target: { value: '#112233' } });
        expect(markers()[0]).toBe('Switch Bühne');
        fireEvent.click(screen.getByText('+ Text'));
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Switches und Raumplan gespeichert');
        expect(savedSettings().switches).toEqual([
            { name: 'Bühne', color: '#9DAEDA' },
            { name: 'Rot', color: '#112233' },
            { name: 'Grün', color: '#9DDAAA' },
            { name: 'Weiß', color: '#ECECEC' },
        ]);
        const plan = parseFloorPlan(savedSettings().floorPlan);
        expect(plan?.elements.filter(element => element.type === 'switch').map(element => element.switchIndex)).toEqual([0, 1, 2, 3]);
        expect(plan?.elements.filter(element => element.type === 'text').map(element => element.text)).toEqual(['getränke', 'food', 'toilett', '↓', 'food', 'toilett', '↓', 'Text']);
        expect(screen.getByLabelText('Name der Switch 1')).toHaveValue('Bühne');
    });

    it('removes the stored plan when the plan is empty', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        stubSettings({ switches: [] });
        renderPage();
        await screen.findByText('+ Switch hinzufügen');

        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Switches und Raumplan gespeichert');
        expect(savedSettings()).toEqual({ switches: [], floorPlan: '' });
    });

    it('requires a name for every switch', async () => {
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

        fireEvent.change(screen.getByLabelText('Name der Switch 3'), { target: { value: '  ' } });
        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Jede Switch braucht einen Namen');
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)).toHaveLength(0);
    });

    it('shows the error when saving fails', async () => {
        backend.fail('PUT', ADMIN_SETTINGS_URL, 400);
        renderPage();
        await waitFor(() => expect(names()).toHaveLength(4));

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
        await waitFor(() => expect(names()).toHaveLength(4));

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});
