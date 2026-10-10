import { render, screen } from '@testing-library/react';
import { makeGame, makeTeam, makeTeams, makeUser } from '../../test/fixtures';
import { GameReturnDTO } from '../../util/api/config/dto';
import PauseComponent from './PauseComponent';
import PauseComponentAll from './PauseComponentAll';
import PauseComponentSwiper from './PauseComponentSwiper';
import RoundComponentAll from './RoundComponentAll';
import RoundComponentSwiper from './RoundComponentSwiper';
import TeamComponent from './TeamComponent';
import TeamComponent4 from './TeamComponent4';

const slides = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.swiper-slide'));
const teamRows = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.teamContainer'));
const imageSources = (container: HTMLElement) => Array.from(container.querySelectorAll('img')).map(img => img.getAttribute('src'));

describe('TeamComponent', () => {
    it('shows the team with its character and the switch it plays on', () => {
        const { container } = render(<TeamComponent team={makeTeam({ teamName: 'Team Peach', character: { id: 3, characterName: 'Peach' } })} switchColor="Blau" />);

        expect(screen.getByText('Team Peach')).toBeInTheDocument();
        expect(screen.getByText('Switch Blau')).toBeInTheDocument();
        expect(screen.getByAltText('teamcharacter')).toHaveAttribute('src', '/characters/Peach.png');
        expect(container.firstElementChild).toHaveClass('blau');
    });
});

describe('TeamComponent4', () => {
    it('shows the team next to the characters of everyone in the game', () => {
        const game = makeGame();

        const { container } = render(<TeamComponent4 team={game.teams[1]} game={game} switchColor="Rot" />);

        expect(screen.getByText('Team Luigi')).toBeInTheDocument();
        expect(screen.getByText('Switch Rot')).toBeInTheDocument();
        expect(imageSources(container)).toEqual([
            '/characters/Mario.png',
            '/characters/Luigi.png',
            '/characters/Peach.png',
            '/characters/Toad.png',
        ]);
        expect(container.firstElementChild).toHaveClass('rot');
    });
});

describe('PauseComponent', () => {
    it('shows the pausing team with its character', () => {
        render(<PauseComponent team={makeTeam({ teamName: 'Team Toad', character: { id: 4, characterName: 'Toad' } })} />);

        expect(screen.getByText('Team Toad')).toBeInTheDocument();
        expect(screen.getByText('Pause')).toBeInTheDocument();
        expect(screen.getByAltText('teamcharacter')).toHaveAttribute('src', '/characters/Toad.png');
    });
});

describe('PauseComponentAll', () => {
    it('highlights the pausing team as the own team', () => {
        const { container } = render(<PauseComponentAll team={makeTeam()} />);

        expect(teamRows(container)).toHaveLength(1);
        expect(teamRows(container)[0]).toHaveClass('userTeam');
        expect(teamRows(container)[0]).toHaveStyle({ opacity: '1' });
    });

    it('dims an inactive team', () => {
        const { container } = render(<PauseComponentAll team={makeTeam({ active: false })} />);

        expect(teamRows(container)[0]).toHaveStyle({ opacity: '0.5' });
    });
});

describe('PauseComponentSwiper', () => {
    it('shows one slide per pausing team', () => {
        const { container } = render(<PauseComponentSwiper teams={makeTeams()} user={null} />);

        expect(slides(container).map(slide => slide.textContent)).toEqual([
            'Team MarioPause',
            'Team LuigiPause',
            'Team PeachPause',
            'Team ToadPause',
        ]);
    });

    it('puts the own team first and marks the slides as the own pause', () => {
        const { container } = render(<PauseComponentSwiper teams={makeTeams()} user={makeUser({ teamId: 3 })} />);

        expect(slides(container)[0]).toHaveTextContent('Team Peach');
        slides(container).forEach(slide => expect(slide).toHaveClass('loggedIn'));
    });

    it('does not mark the slides when the own team is not pausing', () => {
        const { container } = render(<PauseComponentSwiper teams={makeTeams()} user={makeUser({ teamId: 99 })} />);

        slides(container).forEach(slide => expect(slide).not.toHaveClass('loggedIn'));
    });

    it('dims inactive teams', () => {
        const teams = [makeTeam({ id: 1, active: true }), makeTeam({ id: 2, teamName: 'Team Luigi', active: false })];

        const { container } = render(<PauseComponentSwiper teams={teams} user={null} />);

        expect(slides(container)[0]).toHaveStyle({ opacity: '1' });
        expect(slides(container)[1]).toHaveStyle({ opacity: '0.5' });
    });
});

describe('RoundComponentAll', () => {
    it('lists every team of the game with the switch colour', () => {
        const { container } = render(<RoundComponentAll game={makeGame({ switchGame: 'Grün' })} user={null} switchColor="Grün" />);

        expect(teamRows(container).map(row => row.textContent)).toEqual([
            'Team MarioSwitch Grün',
            'Team LuigiSwitch Grün',
            'Team PeachSwitch Grün',
            'Team ToadSwitch Grün',
        ]);
        teamRows(container).forEach(row => expect(row).toHaveClass('Grün'));
    });

    it('highlights only the own team', () => {
        const { container } = render(<RoundComponentAll game={makeGame()} user={makeUser({ teamId: 2 })} switchColor="Rot" />);

        expect(teamRows(container).map(row => row.classList.contains('userTeam'))).toEqual([false, true, false, false]);
    });

    it('dims inactive teams', () => {
        const teams = [makeTeam({ id: 1 }), makeTeam({ id: 2, teamName: 'Team Luigi', active: false })];

        const { container } = render(<RoundComponentAll game={makeGame({ teams })} user={null} switchColor="Rot" />);

        expect(teamRows(container)[0]).toHaveStyle({ opacity: '1' });
        expect(teamRows(container)[1]).toHaveStyle({ opacity: '0.5' });
    });

    it('explains that there are no games when the game is missing', () => {
        render(<RoundComponentAll game={undefined as unknown as GameReturnDTO} user={null} switchColor="Rot" />);

        expect(screen.getByText('Du hast aktuell keine Spiele.')).toBeInTheDocument();
    });
});

describe('RoundComponentSwiper', () => {
    it('shows one slide per team of the game', () => {
        const { container } = render(<RoundComponentSwiper game={makeGame()} user={null} switchColor="Rot" />);

        expect(slides(container).map(slide => slide.textContent)).toEqual([
            'Team MarioSwitch Rot',
            'Team LuigiSwitch Rot',
            'Team PeachSwitch Rot',
            'Team ToadSwitch Rot',
        ]);
    });

    it('marks the slides of the game the own team plays in', () => {
        const { container } = render(<RoundComponentSwiper game={makeGame()} user={makeUser({ teamId: 4 })} switchColor="Rot" />);

        slides(container).forEach(slide => expect(slide).toHaveClass('loggedIn'));
    });

    it('does not mark the slides of other games', () => {
        const { container } = render(<RoundComponentSwiper game={makeGame()} user={makeUser({ teamId: 99 })} switchColor="Rot" />);

        slides(container).forEach(slide => expect(slide).not.toHaveClass('loggedIn'));
    });

    it('dims inactive teams', () => {
        const teams = [makeTeam({ id: 1 }), makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' }, active: false })];

        const { container } = render(<RoundComponentSwiper game={makeGame({ teams })} user={null} switchColor="Rot" />);

        expect(slides(container)[0]).toHaveStyle({ opacity: '1' });
        expect(slides(container)[1]).toHaveStyle({ opacity: '0.5' });
    });

    it('renders nothing when the game is missing', () => {
        const { container } = render(<RoundComponentSwiper game={undefined as unknown as GameReturnDTO} user={null} switchColor="Rot" />);

        expect(container).toBeEmptyDOMElement();
    });
});
