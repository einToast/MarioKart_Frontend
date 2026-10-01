import { fireEvent, render, screen } from '@testing-library/react';
import { createOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { makeQuestion, makeTeam } from '../../test/fixtures';
import { QuestionReturnDTO, TeamReturnDTO } from '../../util/api/config/dto';
import { QuestionType } from '../../util/service/util';
import SurveyAdminListItem from './SurveyAdminListItem';
import TeamAdminListItem from './TeamAdminListItem';

/** The edit icon has no title, so it is looked up through the icon it displays. */
const editIcon = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLIonIconElement>('ion-icon')).find(icon => icon.icon === createOutline) as HTMLElement;

describe('SurveyAdminListItem', () => {
    const renderItem = (overrides: Partial<QuestionReturnDTO> = {}) => {
        const survey = makeQuestion({ id: 7, ...overrides });
        const handlers = {
            onToggleVisibility: vi.fn(),
            onToggleActive: vi.fn(),
            onOpenAnswerModal: vi.fn(),
            onOpenStatisticsModal: vi.fn(),
            onOpenChangeModal: vi.fn(),
            onOpenDeleteModal: vi.fn(),
        };
        const view = render(<SurveyAdminListItem survey={survey} {...handlers} />);
        return { ...view, survey, handlers };
    };

    it('shows the question text', () => {
        renderItem({ questionText: 'Wer gewinnt?' });

        expect(screen.getByText('Wer gewinnt?')).toBeInTheDocument();
    });

    it('highlights a visible survey', () => {
        const { container } = renderItem({ visible: true });

        expect(container.querySelector('.currentSurvey')).toHaveClass('active');
    });

    it('does not highlight a hidden survey', () => {
        const { container } = renderItem({ visible: false });

        expect(container.querySelector('.currentSurvey')).not.toHaveClass('active');
    });

    it('marks surveys that allow one answer per survey key', () => {
        renderItem({ oneAnswerPerKey: true });

        expect(screen.getByTitle('Eine Antwort pro Umfrage-Schlüssel')).toBeInTheDocument();
    });

    it('does not mark surveys with unlimited answers', () => {
        renderItem({ oneAnswerPerKey: false });

        expect(screen.queryByTitle('Eine Antwort pro Umfrage-Schlüssel')).not.toBeInTheDocument();
    });

    it.each([
        [true, 'Umfrage unsichtbar machen', eyeOutline],
        [false, 'Umfrage sichtbar machen', eyeOffOutline],
    ])('offers the matching visibility action for visible=%s', (visible, title, icon) => {
        renderItem({ visible });

        expect((screen.getByTitle(title) as HTMLIonIconElement).icon).toBe(icon);
    });

    it.each([
        [true, 'Teilnahme deaktivieren'],
        [false, 'Teilnahme aktivieren'],
    ])('offers the matching participation action for active=%s', (active, title) => {
        renderItem({ active });

        expect(screen.getByTitle(title)).toBeInTheDocument();
    });

    it.each([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.TEAM])('offers a graph for %s surveys', (questionType) => {
        renderItem({ questionType });

        expect(screen.getByTitle('Graph anzeigen')).toBeInTheDocument();
    });

    it.each([QuestionType.FREE_TEXT, QuestionType.TEAM_ONE_FREE_TEXT])('offers no graph for %s surveys', (questionType) => {
        renderItem({ questionType });

        expect(screen.queryByTitle('Graph anzeigen')).not.toBeInTheDocument();
    });

    describe.each([
        ['click', (element: HTMLElement) => fireEvent.click(element)],
        ['Enter key', (element: HTMLElement) => fireEvent.keyDown(element, { key: 'Enter' })],
        ['space key', (element: HTMLElement) => fireEvent.keyDown(element, { key: ' ' })],
    ])('on %s', (_name, activate) => {
        it('opens the results', () => {
            const { survey, handlers } = renderItem();

            activate(screen.getByTitle('Ergebnisse anzeigen'));

            expect(handlers.onOpenAnswerModal).toHaveBeenCalledWith(survey);
        });

        it('opens the graph', () => {
            const { survey, handlers } = renderItem();

            activate(screen.getByTitle('Graph anzeigen'));

            expect(handlers.onOpenStatisticsModal).toHaveBeenCalledWith(survey);
        });

        it('opens the editor', () => {
            const { container, survey, handlers } = renderItem();

            activate(editIcon(container));

            expect(handlers.onOpenChangeModal).toHaveBeenCalledWith(survey);
        });

        it('toggles the visibility by id', () => {
            const { handlers } = renderItem({ visible: true });

            activate(screen.getByTitle('Umfrage unsichtbar machen'));

            expect(handlers.onToggleVisibility).toHaveBeenCalledWith(7);
        });

        it('toggles the participation by id', () => {
            const { handlers } = renderItem({ active: true });

            activate(screen.getByTitle('Teilnahme deaktivieren'));

            expect(handlers.onToggleActive).toHaveBeenCalledWith(7);
        });

        it('opens the delete confirmation', () => {
            const { survey, handlers } = renderItem();

            activate(screen.getByTitle('Umfrage löschen'));

            expect(handlers.onOpenDeleteModal).toHaveBeenCalledWith(survey);
        });
    });

    it('ignores other keys', () => {
        const { handlers } = renderItem();

        fireEvent.keyDown(screen.getByTitle('Umfrage löschen'), { key: 'Tab' });

        expect(handlers.onOpenDeleteModal).not.toHaveBeenCalled();
    });
});

describe('TeamAdminListItem', () => {
    const renderItem = (overrides: Partial<TeamReturnDTO> = {}, flags: { scheduleCreated?: boolean; finalScheduleCreated?: boolean } = {}) => {
        const team = makeTeam({ id: 5, teamName: 'Team Toad', character: { id: 4, characterName: 'Toad' }, groupPoints: 30, finalPoints: 12, ...overrides });
        const handlers = {
            onToggleFinalParticipation: vi.fn(),
            onToggleActive: vi.fn(),
            onOpenChangeModal: vi.fn(),
            onOpenDeleteModal: vi.fn(),
        };
        const view = render(
            <TeamAdminListItem
                team={team}
                scheduleCreated={flags.scheduleCreated ?? false}
                finalScheduleCreated={flags.finalScheduleCreated ?? false}
                {...handlers}
            />
        );
        return { ...view, team, handlers };
    };

    it('shows the team with its character and both scores', () => {
        renderItem();

        expect(screen.getByText('Team Toad')).toBeInTheDocument();
        expect(screen.getByText('30 Punkte')).toBeInTheDocument();
        expect(screen.getByText('12 Finalpunkte')).toBeInTheDocument();
        expect(screen.getByAltText('Toad')).toHaveAttribute('src', '/characters/Toad.png');
    });

    it('offers every action before the schedule exists', () => {
        renderItem();

        expect(screen.getByTitle('Team bearbeiten')).toBeInTheDocument();
        expect(screen.getByTitle('Team nicht am Finale teilnehmen lassen')).toBeInTheDocument();
        expect(screen.getByTitle('Team deaktivieren')).toBeInTheDocument();
        expect(screen.getByTitle('Team löschen')).toBeInTheDocument();
    });

    it('does not offer deleting once the schedule exists', () => {
        renderItem({}, { scheduleCreated: true });

        expect(screen.queryByTitle('Team löschen')).not.toBeInTheDocument();
        expect(screen.getByTitle('Team deaktivieren')).toBeInTheDocument();
    });

    it('only offers editing once the final schedule exists', () => {
        renderItem({}, { scheduleCreated: true, finalScheduleCreated: true });

        expect(screen.getByTitle('Team bearbeiten')).toBeInTheDocument();
        expect(screen.queryByTitle(/Finale teilnehmen/)).not.toBeInTheDocument();
        expect(screen.queryByTitle(/Team (de)?aktivieren/)).not.toBeInTheDocument();
        expect(screen.queryByTitle('Team löschen')).not.toBeInTheDocument();
    });

    it('offers to add a team that is not in the final and to activate an inactive team', () => {
        renderItem({ finalReady: false, active: false });

        expect(screen.getByTitle('Team am Finale teilnehmen lassen')).toBeInTheDocument();
        expect(screen.getByTitle('Team aktivieren')).toBeInTheDocument();
    });

    it('opens the editor', () => {
        const { team, handlers } = renderItem();

        fireEvent.click(screen.getByTitle('Team bearbeiten'));

        expect(handlers.onOpenChangeModal).toHaveBeenCalledWith(team);
    });

    it('toggles the final participation', () => {
        const { team, handlers } = renderItem();

        fireEvent.click(screen.getByTitle('Team nicht am Finale teilnehmen lassen'));

        expect(handlers.onToggleFinalParticipation).toHaveBeenCalledWith(team);
    });

    it('toggles the activity', () => {
        const { team, handlers } = renderItem();

        fireEvent.click(screen.getByTitle('Team deaktivieren'));

        expect(handlers.onToggleActive).toHaveBeenCalledWith(team);
    });

    it('opens the delete confirmation', () => {
        const { team, handlers } = renderItem();

        fireEvent.click(screen.getByTitle('Team löschen'));

        expect(handlers.onOpenDeleteModal).toHaveBeenCalledWith(team);
    });
});
