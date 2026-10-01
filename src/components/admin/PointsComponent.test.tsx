import { IonAccordionGroup } from '@ionic/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { backend } from '../../test/backend';
import { makeGame, makePoints, makeTeams } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { GameReturnDTO } from '../../util/api/config/dto';
import PointsComponent from './PointsComponent';

const SAVE = 'Spiel speichern';

const gameWithPoints = (overrides: Partial<GameReturnDTO> = {}): GameReturnDTO => {
    const teams = makeTeams();
    return makeGame({
        id: 3,
        switchGame: 'Rot',
        teams,
        points: [makePoints(teams[0], 15), makePoints(teams[1], 12), makePoints(teams[2], 9), makePoints(teams[3], 6)],
        ...overrides,
    });
};

const renderPoints = (game: GameReturnDTO) =>
    render(
        <IonAccordionGroup>
            <PointsComponent game={game} roundId={6} isOpen={true} toggleAccordion={vi.fn()} />
        </IonAccordionGroup>
    );

const inputs = () => screen.getAllByRole('spinbutton') as HTMLInputElement[];
const setPoints = (index: number, value: string) => fireEvent.change(inputs()[index], { target: { value } });

describe('PointsComponent', () => {
    it('names the switch the game is played on', () => {
        renderPoints(gameWithPoints({ switchGame: 'Blau' }));

        expect(screen.getByRole('heading', { name: 'Switch Blau' })).toHaveClass('blau');
    });

    it('derives the colour class of switches with umlauts without the umlaut', () => {
        renderPoints(gameWithPoints({ switchGame: 'Grün' }));

        expect(screen.getByRole('heading', { name: 'Switch Grün' })).toHaveClass('gruen');
    });

    it('shows the points of every team next to its character', () => {
        const { container } = renderPoints(gameWithPoints());

        expect(inputs().map(input => input.value)).toEqual(['15', '12', '9', '6']);
        expect(Array.from(container.querySelectorAll('img')).map(img => img.getAttribute('src'))).toEqual([
            '/characters/Mario.png',
            '/characters/Luigi.png',
            '/characters/Peach.png',
            '/characters/Toad.png',
        ]);
    });

    it('matches points to teams by team, not by position', () => {
        const teams = makeTeams();
        const game = gameWithPoints({
            teams,
            points: [makePoints(teams[3], 6), makePoints(teams[2], 9), makePoints(teams[1], 12), makePoints(teams[0], 15)],
        });

        renderPoints(game);

        expect(inputs().map(input => input.value)).toEqual(['15', '12', '9', '6']);
    });

    it('shows 0 points for a game that has no points yet', () => {
        renderPoints(gameWithPoints({ points: null }));

        expect(inputs().map(input => input.value)).toEqual(['0', '0', '0', '0']);
    });

    it('updates the displayed points while typing', () => {
        renderPoints(gameWithPoints());

        setPoints(1, '14');
        setPoints(3, '1');

        expect(inputs().map(input => input.value)).toEqual(['15', '14', '9', '1']);
    });

    it('saves the game with the edited points', async () => {
        const game = gameWithPoints();
        backend.put('/admin/schedule/games/3', game);
        renderPoints(game);

        setPoints(0, '10');
        setPoints(2, '4');
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Spiel erfolgreich gespeichert');
        expect(backend.requests).toHaveLength(1);
        expect(backend.requests[0]).toMatchObject({ method: 'PUT', url: '/admin/schedule/games/3' });
        expect(backend.requests[0].body).toEqual({
            id: 3,
            points: [
                { points: 10, team: { teamName: 'Team Mario', characterName: 'Mario', finalReady: true, active: true } },
                { points: 12, team: { teamName: 'Team Luigi', characterName: 'Luigi', finalReady: true, active: true } },
                { points: 4, team: { teamName: 'Team Peach', characterName: 'Peach', finalReady: true, active: true } },
                { points: 6, team: { teamName: 'Team Toad', characterName: 'Toad', finalReady: true, active: true } },
            ],
        });
    });

    it.each(['Enter', ' '])('saves with the "%s" key', async (key) => {
        const game = gameWithPoints();
        backend.put('/admin/schedule/games/3', game);
        renderPoints(game);

        fireEvent.keyDown(buttonOf(SAVE), { key });

        await expectSuccessToast('Spiel erfolgreich gespeichert');
    });

    it('shows the reason when saving fails', async () => {
        backend.fail('PUT', '/admin/schedule/games/3', 404);
        renderPoints(gameWithPoints());

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Fehler beim Speichern: Spiel nicht gefunden');
    });

    it('reports an error when the backend answers without the saved game', async () => {
        backend.put('/admin/schedule/games/3', undefined);
        renderPoints(gameWithPoints());

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Das Spiel konnte nicht gespeichert werden.');
    });

    it.todo('renders a game with fewer than four teams (currently throws while reading the missing team)');
});
