import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createOutline } from 'ionicons/icons';
import { backend } from '../../test/backend';
import { lastBarProps } from '../../test/charts';
import { makeQuestion, makeTeam } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast, queryToast } from '../../test/overlays';
import { QuestionReturnDTO, TeamReturnDTO } from '../../util/api/config/dto';
import SurveyAdminContainer from './SurveyAdminContainer';
import TeamAdminContainer from './TeamAdminContainer';

describe('TeamAdminContainer', () => {
    const mario = () => makeTeam({ id: 1, teamName: 'Team Mario', character: { id: 1, characterName: 'Mario' }, finalReady: true, active: true });
    const luigi = () => makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' }, finalReady: false, active: false });

    const renderContainer = (teams: TeamReturnDTO[] = [mario(), luigi()]) => {
        const getTeams = vi.fn();
        const setModalClosed = vi.fn();
        const view = render(
            <TeamAdminContainer
                teams={teams}
                scheduleCreated={false}
                finalScheduleCreated={false}
                setModalClosed={setModalClosed}
                getTeams={getTeams}
                modalClosed={false}
            />
        );
        return { ...view, getTeams, setModalClosed };
    };

    const row = (teamName: string) => within(screen.getByText(teamName).closest('.teamContainer') as HTMLElement);
    const dialog = () => within(screen.getByRole('dialog'));

    it('lists every team', () => {
        renderContainer();

        expect(screen.getByText('Team Mario')).toBeInTheDocument();
        expect(screen.getByText('Team Luigi')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    describe('final participation', () => {
        it('removes a team from the final and reloads the teams', async () => {
            backend.put('/admin/teams/1', mario());
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team nicht am Finale teilnehmen lassen'));

            await waitFor(() => expect(getTeams).toHaveBeenCalledTimes(1));
            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/teams/1',
                body: { teamName: 'Team Mario', characterName: 'Mario', finalReady: false, active: true },
            }]);
        });

        it('adds a team to the final', async () => {
            backend.put('/admin/teams/2', luigi());
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Luigi').getByTitle('Team am Finale teilnehmen lassen'));

            await waitFor(() => expect(getTeams).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toMatchObject({ finalReady: true, active: false });
        });

        it('shows the error and does not reload when the update fails', async () => {
            backend.fail('PUT', '/admin/teams/1', 404);
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team nicht am Finale teilnehmen lassen'));

            await expectErrorToast('Team nicht gefunden');
            expect(getTeams).not.toHaveBeenCalled();
        });

        it('reports an error when the backend answers without the updated team', async () => {
            backend.put('/admin/teams/1', undefined);
            renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team nicht am Finale teilnehmen lassen'));

            await expectErrorToast('Finalteilnahme konnte nicht geändert werden');
        });
    });

    describe('activity', () => {
        it('deactivates a team, which also removes it from the final', async () => {
            backend.put('/admin/teams/1', mario());
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team deaktivieren'));

            await waitFor(() => expect(getTeams).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toEqual({ teamName: 'Team Mario', characterName: 'Mario', finalReady: false, active: false });
        });

        it('activates a team without changing its final participation', async () => {
            backend.put('/admin/teams/2', luigi());
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Luigi').getByTitle('Team aktivieren'));

            await waitFor(() => expect(getTeams).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toEqual({ teamName: 'Team Luigi', characterName: 'Luigi', finalReady: false, active: true });
        });

        it('shows the error and does not reload when the update fails', async () => {
            backend.fail('PUT', '/admin/teams/1', 401);
            const { getTeams } = renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team deaktivieren'));

            await expectErrorToast('Nicht autorisierter Zugriff');
            expect(getTeams).not.toHaveBeenCalled();
        });

        it('reports an error when the backend answers without the updated team', async () => {
            backend.put('/admin/teams/1', undefined);
            renderContainer();

            fireEvent.click(row('Team Mario').getByTitle('Team deaktivieren'));

            await expectErrorToast('Aktivität konnte nicht geändert werden');
        });
    });

    describe('editing', () => {
        beforeEach(() => {
            backend.get('/public/teams/characters/available', [{ id: 9, characterName: 'Yoshi' }]);
        });

        it('opens the editor for the chosen team', async () => {
            renderContainer();

            fireEvent.click(row('Team Luigi').getByTitle('Team bearbeiten'));

            expect(await dialog().findByPlaceholderText('Name eingeben')).toHaveValue('Team Luigi');
        });

        it('confirms a saved change, closes the editor and notifies the page', async () => {
            backend.put('/admin/teams/2', luigi());
            const { setModalClosed } = renderContainer();
            fireEvent.click(row('Team Luigi').getByTitle('Team bearbeiten'));
            fireEvent.change(await dialog().findByPlaceholderText('Name eingeben'), { target: { value: 'Die Grünen' } });

            fireEvent.click(dialog().getByText('Team ändern'));

            await expectSuccessToast('Team wurde geändert');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(setModalClosed).toHaveBeenCalledWith(true);
            expect(backend.requestsTo('PUT', '/admin/teams/2')[0].body).toMatchObject({ teamName: 'Die Grünen', characterName: 'Luigi' });
        });

        it('closes the editor without a confirmation on cancel', async () => {
            const { setModalClosed } = renderContainer();
            fireEvent.click(row('Team Luigi').getByTitle('Team bearbeiten'));
            await dialog().findByPlaceholderText('Name eingeben');

            fireEvent.click(dialog().getByText('Abbrechen'));

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(queryToast()).not.toBeInTheDocument();
            expect(setModalClosed).toHaveBeenCalledWith(true);
        });
    });

    describe('deleting', () => {
        it('asks for confirmation for the chosen team', () => {
            renderContainer();

            fireEvent.click(row('Team Luigi').getByTitle('Team löschen'));

            expect(dialog().getByText(/wirklich löschen/)).toHaveTextContent('Willst du das Team Team Luigi wirklich löschen?');
        });

        it('confirms the deletion, closes the dialog and notifies the page', async () => {
            backend.delete('/admin/teams/2');
            const { setModalClosed } = renderContainer();
            fireEvent.click(row('Team Luigi').getByTitle('Team löschen'));

            fireEvent.click(dialog().getByText('Team löschen', { selector: 'p' }));

            await expectSuccessToast('Team wurde entfernt');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(setModalClosed).toHaveBeenCalledWith(true);
        });
    });
});

describe('SurveyAdminContainer', () => {
    const hidden = () => makeQuestion({ id: 1, questionText: 'Wer gewinnt?', options: ['Mario', 'Luigi'], visible: false, active: false });
    const shown = () => makeQuestion({ id: 2, questionText: 'Beste Strecke?', options: ['Regenbogen', 'Kuhmuh'], visible: true, active: true, live: true });

    const renderContainer = (surveys: QuestionReturnDTO[] = [hidden(), shown()]) => {
        const getQuestions = vi.fn();
        const handleModalClose = vi.fn();
        const view = render(<SurveyAdminContainer surveys={surveys} getQuestions={getQuestions} handleModalClose={handleModalClose} />);
        return { ...view, getQuestions, handleModalClose };
    };

    const rowElement = (questionText: string) => screen.getByText(questionText).closest('.currentSurvey') as HTMLElement;
    const row = (questionText: string) => within(rowElement(questionText));
    const editIcon = (questionText: string) =>
        Array.from(rowElement(questionText).querySelectorAll<HTMLIonIconElement>('ion-icon')).find(icon => icon.icon === createOutline) as HTMLElement;
    const dialog = () => within(screen.getByRole('dialog'));

    it('lists every survey under its heading', () => {
        renderContainer();

        expect(screen.getByRole('heading', { name: 'Aktuelle Abstimmungen' })).toBeInTheDocument();
        expect(screen.getByText('Wer gewinnt?')).toBeInTheDocument();
        expect(screen.getByText('Beste Strecke?')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    describe('visibility', () => {
        it('shows a hidden survey, which also opens it for answers, and reloads the surveys', async () => {
            backend.put('/admin/survey/1', hidden());
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage sichtbar machen'));

            await waitFor(() => expect(getQuestions).toHaveBeenCalledTimes(1));
            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/survey/1',
                body: {
                    questionText: 'Wer gewinnt?',
                    questionType: 'MULTIPLE_CHOICE',
                    options: ['Mario', 'Luigi'],
                    visible: true,
                    active: true,
                    live: false,
                    finalTeamsOnly: false,
                    oneAnswerPerKey: false,
                },
            }]);
        });

        it('hides a visible survey, which also closes it for answers', async () => {
            backend.put('/admin/survey/2', shown());
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Umfrage unsichtbar machen'));

            await waitFor(() => expect(getQuestions).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toMatchObject({ visible: false, active: false, live: true });
        });

        it('shows the error and does not reload when the update fails', async () => {
            backend.fail('PUT', '/admin/survey/1', 500);
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage sichtbar machen'));

            await expectErrorToast('Benachrichtigung konnte nicht gesendet werden');
            expect(getQuestions).not.toHaveBeenCalled();
        });

        it('reports an error when the backend answers without the updated survey', async () => {
            backend.put('/admin/survey/1', undefined);
            renderContainer();

            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage sichtbar machen'));

            await expectErrorToast('Frage konnte nicht aktualisiert werden');
        });
    });

    describe('participation', () => {
        it('closes a survey for answers while keeping it visible', async () => {
            backend.put('/admin/survey/2', shown());
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Teilnahme deaktivieren'));

            await waitFor(() => expect(getQuestions).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toMatchObject({ visible: true, active: false });
        });

        it('opens a survey for answers without making it visible', async () => {
            backend.put('/admin/survey/1', hidden());
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Wer gewinnt?').getByTitle('Teilnahme aktivieren'));

            await waitFor(() => expect(getQuestions).toHaveBeenCalledTimes(1));
            expect(backend.requests[0].body).toMatchObject({ visible: false, active: true });
        });

        it('shows the error and does not reload when the update fails', async () => {
            backend.fail('PUT', '/admin/survey/2', 404);
            const { getQuestions } = renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Teilnahme deaktivieren'));

            await expectErrorToast('Frage nicht gefunden');
            expect(getQuestions).not.toHaveBeenCalled();
        });

        it('reports an error when the backend answers without the updated survey', async () => {
            backend.put('/admin/survey/2', undefined);
            renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Teilnahme deaktivieren'));

            await expectErrorToast('Aktivität konnte nicht geändert werden');
        });
    });

    describe('dialogs', () => {
        it('shows the results of the chosen survey and passes the result of closing on', async () => {
            backend.get('/admin/survey/2/statistics', [3, 1]).get('/admin/survey/2/answers/count', 4);
            const { handleModalClose } = renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Ergebnisse anzeigen'));

            expect(await dialog().findByText('Ergebnisse: 4 Antworten')).toBeInTheDocument();
            expect(dialog().getByRole('heading', { name: 'Beste Strecke?' })).toBeInTheDocument();

            fireEvent.click(dialog().getByText('Ergebnisse schließen'));

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(handleModalClose).toHaveBeenCalledWith({ surveyResults: false });
        });

        it('charts the results of the chosen survey', async () => {
            backend.get('/admin/survey/2/statistics', [3, 1]);
            renderContainer();

            fireEvent.click(row('Beste Strecke?').getByTitle('Graph anzeigen'));

            expect(await dialog().findByTestId('bar-chart')).toBeInTheDocument();
            await waitFor(() => expect(lastBarProps().data.datasets[0].data).toEqual([3, 1]));
            expect(lastBarProps().data.labels).toEqual(['Regenbogen', 'Kuhmuh']);
        });

        it('opens the editor for the chosen survey and reports a saved change', async () => {
            backend.put('/admin/survey/2', shown());
            const { handleModalClose } = renderContainer();

            fireEvent.click(editIcon('Beste Strecke?'));
            expect(dialog().getByPlaceholderText('Frage eingeben')).toHaveValue('Beste Strecke?');

            fireEvent.click(dialog().getByText('Umfrage ändern'));

            await waitFor(() => expect(handleModalClose).toHaveBeenCalledWith({ surveyChanged: true }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        });

        it('asks for confirmation before deleting the chosen survey and reports the deletion', async () => {
            backend.delete('/admin/survey/1');
            const { handleModalClose } = renderContainer();

            fireEvent.click(row('Wer gewinnt?').getByTitle('Umfrage löschen'));
            expect(dialog().getByText(/wirklich löschen/)).toHaveTextContent('Willst du die Umfrage Wer gewinnt? wirklich löschen?');

            fireEvent.click(dialog().getByText('Umfrage löschen', { selector: 'p' }));

            await waitFor(() => expect(handleModalClose).toHaveBeenCalledWith({ surveyDeleted: true }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        });
    });
});
