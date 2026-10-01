import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend, stubScheduleState } from '../../test/backend';
import { lastBarProps } from '../../test/charts';
import { makeQuestion, makeTeam } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast, queryToast } from '../../test/overlays';
import { currentPath, renderWithRouter } from '../../test/render';
import Results from './Results';
import SurveyAdmin from './SurveyAdmin';

describe('admin Results', () => {
    const FINAL_TEAMS_URL = '/admin/teams/finalTeams';

    const renderPage = () => renderWithRouter(<Results />, { route: '/admin/results' });

    const finalTeams = () => [
        makeTeam({ id: 1, teamName: 'Team Mario', character: { id: 1, characterName: 'Mario' }, groupPoints: 40, finalPoints: 10 }),
        makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' }, groupPoints: 55, finalPoints: 25 }),
        makeTeam({ id: 3, teamName: 'Team Peach', character: { id: 3, characterName: 'Peach' }, groupPoints: 48, finalPoints: 18 }),
    ];

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(FINAL_TEAMS_URL, finalTeams());
    });

    itRequiresAnAdminSession(renderPage);

    it('presents the group ranking as the interim result before the finals', async () => {
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 0 });

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Zwischenergebnis' })).toBeInTheDocument();
        await waitFor(() => expect(lastBarProps().data.labels).toEqual(['1. Platz', '2. Platz', '3. Platz']));
        expect(lastBarProps().data.datasets[0].data).toEqual([55, 48, 40]);
    });

    it('presents the final ranking as the final result once the finals are scheduled', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        stubScheduleState({ schedule: true, finalSchedule: true, unplayed: 0 });

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Endergebnis' })).toBeInTheDocument();
        await waitFor(() => {
            expect(lastBarProps().data.labels).toEqual(['Team Luigi', 'Team Peach', 'Team Mario']);
            expect(lastBarProps().data.datasets[0].data).toEqual([0, 0, 0]);
        });
    });

    it('shows an error when the teams cannot be loaded', async () => {
        backend.fail('GET', FINAL_TEAMS_URL, 500);

        renderPage();

        await expectErrorToast('Team konnte nicht abgerufen werden');
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await waitFor(() => expect(lastBarProps().data.datasets[0].data).toEqual([55, 48, 40]));
        const link = screen.getByRole('link', { name: 'Zurück' });

        expect(link).toHaveAttribute('href', '/admin/dashboard');
        fireEvent.click(link);

        expect(currentPath()).toBe('/admin/dashboard');
    });
});

describe('admin SurveyAdmin', () => {
    const SURVEYS_URL = '/admin/survey';

    const renderPage = () => renderWithRouter(<SurveyAdmin />, { route: '/admin/survey' });

    const surveys = () => [
        makeQuestion({ id: 1, questionText: 'Wer gewinnt?', options: ['Mario', 'Luigi'], visible: false, active: false }),
        makeQuestion({ id: 2, questionText: 'Beste Strecke?', options: ['Regenbogen', 'Kuhmuh'], visible: true, active: true }),
    ];

    const keyMode = () => screen.getByLabelText('Umfrage-Schlüssel') as HTMLSelectElement;
    const row = (questionText: string) => within(screen.getByText(questionText).closest('.currentSurvey') as HTMLElement);
    const dialog = () => within(screen.getByRole('dialog'));
    const surveyTitles = (container: HTMLElement) => Array.from(container.querySelectorAll('.currentSurvey > p')).map(node => node.textContent);

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(SURVEYS_URL, surveys());
    });

    itRequiresAnAdminSession(renderPage);

    it('lists the surveys', async () => {
        const { container } = renderPage();

        expect(screen.getByRole('heading', { name: 'Umfragen' })).toBeInTheDocument();
        await waitFor(() => expect(surveyTitles(container)).toEqual(['Wer gewinnt?', 'Beste Strecke?']));
        expect(queryToast()).not.toBeInTheDocument();
    });

    it('shows an error when the surveys cannot be loaded', async () => {
        backend.fail('GET', SURVEYS_URL, 500);

        renderPage();

        await expectErrorToast('Fragen konnten nicht geladen werden');
    });

    describe('survey key mode', () => {
        it('offers the three modes and shows the current one', async () => {
            backend.get('/public/settings', { tournamentOpen: true, surveyKeyMode: 'DISTRIBUTING' });

            renderPage();

            await waitFor(() => expect(keyMode()).toHaveValue('DISTRIBUTING'));
            expect(Array.from(keyMode().options).map(option => option.textContent)).toEqual(['Aus', 'Schlüssel verteilen', 'Nur mit Schlüssel']);
        });

        it.each([
            ['DISTRIBUTING', 'Geräte erhalten bei ihrer ersten Antwort einen Umfrage-Schlüssel'],
            ['REQUIRED', 'Nur Geräte mit Umfrage-Schlüssel können abstimmen'],
        ])('switches to %s and explains what that means', async (mode, explanation) => {
            backend.put('/admin/settings', { surveyKeyMode: mode });
            renderPage();
            await screen.findByText('Wer gewinnt?');

            fireEvent.change(keyMode(), { target: { value: mode } });

            await expectSuccessToast(explanation);
            expect(backend.requestsTo('PUT', '/admin/settings')[0].body).toEqual({ surveyKeyMode: mode });
            expect(keyMode()).toHaveValue(mode);
        });

        it('switches the keys off again', async () => {
            backend.get('/public/settings', { tournamentOpen: true, surveyKeyMode: 'REQUIRED' }).put('/admin/settings', { surveyKeyMode: 'DISABLED' });
            renderPage();
            await waitFor(() => expect(keyMode()).toHaveValue('REQUIRED'));

            fireEvent.change(keyMode(), { target: { value: 'DISABLED' } });

            await expectSuccessToast('Umfrage-Schlüssel deaktiviert, alle können abstimmen');
            expect(keyMode()).toHaveValue('DISABLED');
        });

        it('shows the error and keeps the current mode when the change fails', async () => {
            backend.fail('PUT', '/admin/settings', 401);
            renderPage();
            await screen.findByText('Wer gewinnt?');

            fireEvent.change(keyMode(), { target: { value: 'REQUIRED' } });

            await expectErrorToast('Nicht autorisierter Zugriff');
            expect(keyMode()).toHaveValue('DISABLED');
        });

        it('shows an error when the current mode cannot be loaded', async () => {
            backend.fail('GET', '/public/settings', 404);

            renderPage();

            await expectErrorToast('Einstellungen nicht gefunden');
        });
    });

    describe('creating a survey', () => {
        it.each([
            ['click', (element: HTMLElement) => fireEvent.click(element)],
            ['Enter key', (element: HTMLElement) => fireEvent.keyDown(element, { key: 'Enter' })],
            ['space key', (element: HTMLElement) => fireEvent.keyDown(element, { key: ' ' })],
        ])('opens the form for a new survey (%s)', async (_name, activate) => {
            const { container } = renderPage();
            await screen.findByText('Wer gewinnt?');

            activate(container.querySelector('.newSurvey') as HTMLElement);

            expect(dialog().getByPlaceholderText('Frage eingeben')).toHaveValue('');
        });

        it('confirms a created survey, closes the form and reloads the list', async () => {
            backend.post(SURVEYS_URL, makeQuestion({ id: 3 }));
            const { container } = renderPage();
            await screen.findByText('Wer gewinnt?');
            fireEvent.click(container.querySelector('.newSurvey') as HTMLElement);
            fireEvent.change(dialog().getByPlaceholderText('Frage eingeben'), { target: { value: 'Feedback?' } });
            fireEvent.change(dialog().getAllByRole('combobox')[0], { target: { value: 'FREE_TEXT' } });
            backend.get(SURVEYS_URL, [...surveys(), makeQuestion({ id: 3, questionText: 'Feedback?', questionType: 'FREE_TEXT' as never, options: [] })]);

            fireEvent.click(dialog().getByText('Umfrage speichern'));

            await expectSuccessToast('Umfrage erfolgreich erstellt');
            await waitFor(() => expect(surveyTitles(container)).toEqual(['Wer gewinnt?', 'Beste Strecke?', 'Feedback?']));
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('closes the form without a confirmation on cancel', async () => {
            const { container } = renderPage();
            await screen.findByText('Wer gewinnt?');
            fireEvent.click(container.querySelector('.newSurvey') as HTMLElement);

            fireEvent.click(dialog().getByText('Abbrechen'));

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(queryToast()).not.toBeInTheDocument();
        });
    });

    describe('managing surveys', () => {
        it('reloads the list after a survey was made visible', async () => {
            backend.put('/admin/survey/1', surveys()[0]);
            renderPage();
            await screen.findByText('Wer gewinnt?');
            backend.get(SURVEYS_URL, surveys().map(survey => ({ ...survey, visible: true, active: true })));

            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage sichtbar machen'));

            expect(await row('Wer gewinnt?').findByTitle('Umfrage unsichtbar machen')).toBeInTheDocument();
        });

        it('confirms a changed survey and reloads the list', async () => {
            backend.put('/admin/survey/2', surveys()[1]);
            const { container } = renderPage();
            await screen.findByText('Beste Strecke?');
            const editIcon = (screen.getByText('Beste Strecke?').closest('.currentSurvey') as HTMLElement).querySelectorAll('ion-icon')[2];
            fireEvent.click(editIcon);
            fireEvent.change(dialog().getByPlaceholderText('Frage eingeben'), { target: { value: 'Schönste Strecke?' } });
            backend.get(SURVEYS_URL, [surveys()[0], { ...surveys()[1], questionText: 'Schönste Strecke?' }]);

            fireEvent.click(dialog().getByText('Umfrage ändern'));

            await expectSuccessToast('Umfrage erfolgreich geändert');
            await waitFor(() => expect(surveyTitles(container)).toEqual(['Wer gewinnt?', 'Schönste Strecke?']));
            expect(backend.requestsTo('PUT', '/admin/survey/2')[0].body).toMatchObject({ questionText: 'Schönste Strecke?' });
        });

        it('confirms a deleted survey and reloads the list', async () => {
            backend.delete('/admin/survey/1');
            const { container } = renderPage();
            await screen.findByText('Wer gewinnt?');
            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage löschen'));
            backend.get(SURVEYS_URL, [surveys()[1]]);

            fireEvent.click(dialog().getByText('Umfrage löschen', { selector: 'p' }));

            await expectSuccessToast('Umfrage erfolgreich gelöscht');
            await waitFor(() => expect(surveyTitles(container)).toEqual(['Beste Strecke?']));
        });
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await screen.findByText('Wer gewinnt?');

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});
