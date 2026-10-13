import { IonAccordionGroup } from '@ionic/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { backend } from '../../test/backend';
import { makeEightTeams, makeGame, makePoints, makeSwitches, makeTeams } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { GameReturnDTO } from '../../util/api/config/dto';
import { AdminOcrService } from '../../util/service';
import PointsComponent from './PointsComponent';

const SAVE = 'Spiel speichern';

const gameWithPoints = (overrides: Partial<GameReturnDTO> = {}): GameReturnDTO => {
    const teams = makeTeams();
    return makeGame({
        id: 3,
        switchIndex: 1,
        teams,
        points: [makePoints(teams[0], 15), makePoints(teams[1], 12), makePoints(teams[2], 9), makePoints(teams[3], 6)],
        ...overrides,
    });
};

const renderPoints = (game: GameReturnDTO, switches = makeSwitches(), ocrProvider?: string) =>
    render(
        <IonAccordionGroup>
            <PointsComponent game={game} roundId={6} isOpen={true} toggleAccordion={vi.fn()} switches={switches} ocrProvider={ocrProvider} />
        </IonAccordionGroup>
    );

const inputs = () => screen.getAllByRole('spinbutton') as HTMLInputElement[];
const setPoints = (index: number, value: string) => fireEvent.change(inputs()[index], { target: { value } });

describe('PointsComponent', () => {
    it('names the switch the game is played on', () => {
        renderPoints(gameWithPoints({ switchIndex: 0 }));

        expect(screen.getByRole('heading', { name: 'Switch Blau' })).toHaveStyle({ color: '#9DAEDA' });
    });

    it('numbers a switch that has not been configured', () => {
        renderPoints(gameWithPoints({ switchIndex: 2 }), []);

        expect(screen.getByRole('heading', { name: 'Switch 3' })).toHaveStyle({ color: '#9DDAAA' });
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

    describe('point detection', () => {
        const OCR_URL = '/admin/ocr/6/3';
        const photoInput = () => screen.getByLabelText('Foto von Switch Rot');
        const choosePhoto = () => fireEvent.change(photoInput(), { target: { files: [new File(['image'], 'result.jpg', { type: 'image/jpeg' })] } });
        const evaluatePhoto = () => {
            choosePhoto();
            fireEvent.click(screen.getByText('Foto auswerten'));
        };

        beforeEach(() => {
            // jsdom has no object URLs
            let photos = 0;
            URL.createObjectURL = vi.fn(() => `blob:photo-${++photos}`);
            URL.revokeObjectURL = vi.fn();
            AdminOcrService.clearGamePhotos();
        });

        it('offers no photo without a provider', () => {
            renderPoints(gameWithPoints());

            expect(screen.queryByText('Foto auswählen')).not.toBeInTheDocument();
        });

        it('opens the photo chooser from the button', () => {
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');
            const click = vi.spyOn(photoInput() as HTMLInputElement, 'click');

            fireEvent.click(screen.getByText('Foto auswählen'));

            expect(click).toHaveBeenCalledTimes(1);
            expect(screen.queryByText('Foto auswerten')).not.toBeInTheDocument();
        });

        it('shows the chosen photo without evaluating it', () => {
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            choosePhoto();

            expect(screen.getByAltText('Ergebnis von Switch Rot')).toHaveAttribute('src', 'blob:photo-1');
            expect(screen.getByText('Anderes Foto auswählen')).toBeInTheDocument();
            expect(backend.requests).toHaveLength(0);
        });

        it('shows the photo next to the points', () => {
            const { container } = renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            choosePhoto();

            const comparison = container.querySelector('.pointsComparison') as HTMLElement;
            expect(comparison).toContainElement(inputs()[0]);
            expect(comparison).toContainElement(screen.getByAltText('Ergebnis von Switch Rot'));
        });

        it('shows a newly chosen photo unzoomed', () => {
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');
            choosePhoto();
            fireEvent.doubleClick(screen.getByAltText('Ergebnis von Switch Rot'));
            expect(screen.getByAltText('Ergebnis von Switch Rot').style.transform).toContain('scale(3)');

            choosePhoto();

            expect(screen.getByAltText('Ergebnis von Switch Rot').style.transform).toContain('scale(1)');
        });

        it('replaces the photo with another one', () => {
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            choosePhoto();
            choosePhoto();

            expect(screen.getByAltText('Ergebnis von Switch Rot')).toHaveAttribute('src', 'blob:photo-2');
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-1');
        });

        it('still shows the photo after the game was rendered anew', () => {
            const first = renderPoints(gameWithPoints(), makeSwitches(), 'openai');
            choosePhoto();
            first.unmount();

            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            expect(screen.getByAltText('Ergebnis von Switch Rot')).toHaveAttribute('src', 'blob:photo-1');
            expect(screen.getByText('Foto auswerten')).toBeInTheDocument();
        });

        it('enters the detected points by character and saves them with the game', async () => {
            const game = gameWithPoints();
            backend
                .post(OCR_URL, { characters: [{ name: 'Toad', points: 1, place: 4 }, { name: 'Mario', points: 9, place: 1 }, { name: 'Peach', points: 3, place: 3 }, { name: 'Luigi', points: 5, place: 2 }] })
                .put('/admin/schedule/games/3', game);
            renderPoints(game, makeSwitches(), 'openai');

            evaluatePhoto();

            await expectSuccessToast('Switch Rot: Punkte erkannt, bitte prüfen und speichern');
            expect(backend.requestsTo('POST', OCR_URL)[0].body).toEqual({ provider: 'openai', image: 'aW1hZ2U=' });
            expect(inputs().map(input => input.value)).toEqual(['9', '5', '3', '1']);
            expect(screen.getByAltText('Ergebnis von Switch Rot')).toBeInTheDocument();

            fireEvent.click(screen.getByText(SAVE));

            await expectSuccessToast('Spiel erfolgreich gespeichert');
            const body = backend.requestsTo('PUT', '/admin/schedule/games/3')[0].body as { points: { points: number }[] };
            expect(body.points.map(entry => entry.points)).toEqual([9, 5, 3, 1]);
        });

        it('keeps the points of characters the photo does not show and says so', async () => {
            backend.post(OCR_URL, { characters: [{ name: 'Mario', points: 9 }, { name: 'Yoshi', points: 7 }] });
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            evaluatePhoto();

            await expectErrorToast('Switch Rot: Nicht alle Charaktere wurden erkannt');
            expect(inputs().map(input => input.value)).toEqual(['9', '12', '9', '6']);
        });

        it('says so when nothing was detected', async () => {
            backend.post(OCR_URL, { characters: [] });
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            evaluatePhoto();

            await expectErrorToast('Switch Rot: Auf dem Foto wurden keine Punkte erkannt');
            expect(inputs().map(input => input.value)).toEqual(['15', '12', '9', '6']);
        });

        it('shows the reason when the photo cannot be evaluated', async () => {
            backend.fail('POST', OCR_URL, 500);
            renderPoints(gameWithPoints(), makeSwitches(), 'openai');

            evaluatePhoto();

            await expectErrorToast('Switch Rot: Foto konnte nicht ausgewertet werden');
            expect(screen.getByText('Foto auswerten')).toBeInTheDocument();
        });
    });

    it('renders a game with fewer than four teams', () => {
        const teams = makeTeams().slice(0, 2);

        renderPoints(gameWithPoints({ teams, points: [makePoints(teams[0], 15), makePoints(teams[1], 12)] }));

        expect(inputs().map(input => input.value)).toEqual(['15', '12']);
    });

    it('edits and saves a game with eight teams', async () => {
        const teams = makeEightTeams();
        const game = gameWithPoints({ teams, points: teams.map((team, index) => makePoints(team, 15 - index)) });
        backend.put('/admin/schedule/games/3', game);
        renderPoints(game);

        expect(inputs().map(input => input.value)).toEqual(['15', '14', '13', '12', '11', '10', '9', '8']);
        setPoints(7, '1');
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Spiel erfolgreich gespeichert');
        const body = backend.requests[0].body as { points: { points: number }[] };
        expect(body.points.map(entry => entry.points)).toEqual([15, 14, 13, 12, 11, 10, 9, 1]);
    });
});
