import { render, screen } from '@testing-library/react';
import { makeGame, makeSwitches, makeTeam, makeUser } from '../../test/fixtures';
import { GameReturnDTO, TeamReturnDTO } from '../../util/api/config/dto';
import { GameList } from './GameList';

const team = (id: number, name: string): TeamReturnDTO =>
    makeTeam({ id, teamName: `Team ${name}`, character: { id, characterName: name } });

const mario = () => team(1, 'Mario');
const luigi = () => team(2, 'Luigi');
const peach = () => team(3, 'Peach');
const toad = () => team(4, 'Toad');
const yoshi = () => team(5, 'Yoshi');
const wario = () => team(6, 'Wario');

// Two games: Mario and Luigi play on the red switch, Peach and Toad on the blue one
const twoGames = (): GameReturnDTO[] => [
    makeGame({ id: 1, switchIndex: 1, teams: [mario(), luigi()] }),
    makeGame({ id: 2, switchIndex: 0, teams: [peach(), toad()] }),
];

// Every block of the list (one per game or pause group) with the text it shows, in order
const blocks = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('.roundContainer')).map(block => block.textContent);

const slides = (block: Element) => Array.from(block.querySelectorAll<HTMLElement>('.swiper-slide'));

describe('GameList', () => {
    describe('personal view', () => {
        it('shows only the game of the own team', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 4 })} viewType="personal" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(blocks(container)).toHaveLength(1);
            expect(screen.getByText('Team Toad')).toBeInTheDocument();
            expect(screen.getByText('Team Peach')).toBeInTheDocument();
            expect(screen.queryByText('Team Mario')).not.toBeInTheDocument();
        });

        it('lists the own team first', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 4 })} viewType="personal" teamsNotInRound={[]} switches={makeSwitches()} />);

            const rows = Array.from(container.querySelectorAll('.teamContainer'));
            expect(rows.map(row => row.textContent)).toEqual(['Team ToadSwitch Blau', 'Team PeachSwitch Blau']);
            expect(rows[0]).toHaveClass('userTeam');
        });

        it('shows the own team as pausing when it has no game in the round', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 5 })} viewType="personal" teamsNotInRound={[yoshi(), wario()]} switches={makeSwitches()} />);

            expect(blocks(container)).toEqual(['Team YoshiPause']);
        });

        it('says that there is no game when the team neither plays nor pauses', () => {
            render(<GameList games={twoGames()} user={makeUser({ teamId: 99 })} viewType="personal" teamsNotInRound={[yoshi()]} switches={makeSwitches()} />);

            expect(screen.getByText('Du hast kein Spiel in dieser Runde.')).toBeInTheDocument();
        });

        it('says that there is no game when nobody is logged in', () => {
            render(<GameList games={twoGames()} user={null} viewType="personal" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(screen.getByText('Du hast kein Spiel in dieser Runde.')).toBeInTheDocument();
        });
    });

    describe('view of all games', () => {
        it('shows every game as a swiper', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 99 })} viewType="all" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(blocks(container)).toEqual([
                'Team MarioSwitch RotTeam LuigiSwitch Rot',
                'Team PeachSwitch BlauTeam ToadSwitch Blau',
            ]);
            expect(container.querySelectorAll('.swiper')).toHaveLength(2);
        });

        it('shows the game of the own team first, starting with the own team', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 4 })} viewType="all" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(blocks(container)).toEqual([
                'Team ToadSwitch BlauTeam PeachSwitch Blau',
                'Team MarioSwitch RotTeam LuigiSwitch Rot',
            ]);
        });

        it('shows the pausing teams after the games', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 1 })} viewType="all" teamsNotInRound={[yoshi(), wario()]} switches={makeSwitches()} />);

            expect(blocks(container)).toEqual([
                'Team MarioSwitch RotTeam LuigiSwitch Rot',
                'Team PeachSwitch BlauTeam ToadSwitch Blau',
                'Team YoshiPauseTeam WarioPause',
            ]);
        });

        it('shows the pausing teams before the games when the own team pauses, starting with the own team', () => {
            const { container } = render(<GameList games={twoGames()} user={makeUser({ teamId: 6 })} viewType="all" teamsNotInRound={[yoshi(), wario()]} switches={makeSwitches()} />);

            expect(blocks(container)).toEqual([
                'Team WarioPauseTeam YoshiPause',
                'Team MarioSwitch RotTeam LuigiSwitch Rot',
                'Team PeachSwitch BlauTeam ToadSwitch Blau',
            ]);
            const pauseSlides = slides(container.querySelector('.roundContainer') as Element);
            pauseSlides.forEach(slide => expect(slide).toHaveClass('loggedIn'));
        });

        it('shows no pause block when every team plays', () => {
            render(<GameList games={twoGames()} user={makeUser({ teamId: 1 })} viewType="all" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(screen.queryByText('Pause')).not.toBeInTheDocument();
        });

        it('says that there is no game when the round has no games', () => {
            render(<GameList games={[]} user={makeUser({ teamId: 1 })} viewType="all" teamsNotInRound={[]} switches={makeSwitches()} />);

            expect(screen.getByText('Du hast kein Spiel in dieser Runde.')).toBeInTheDocument();
        });
    });
});
