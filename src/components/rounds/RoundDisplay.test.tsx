import { fireEvent, render, screen } from '@testing-library/react';
import { makeBreak, makeRound, makeUser } from '../../test/fixtures';
import { RoundReturnDTO } from '../../util/api/config/dto';
import { RoundDisplay } from './RoundDisplay';
import { RoundHeader } from './RoundHeader';

describe('RoundDisplay', () => {
    const formattedRound = () => makeRound({ startTime: '16:45', endTime: '17:05' });

    it('shows the title, the time span and the game of the own team', () => {
        const { container } = render(<RoundDisplay round={formattedRound()} title="Aktuelles Spiel" user={makeUser({ teamId: 1 })} viewType="personal" teamsNotInRound={[]} />);

        expect(screen.getByRole('heading', { name: 'Aktuelles Spiel' })).toBeInTheDocument();
        expect(container.querySelector('.timeStamp')).toHaveTextContent('16:45 - 17:05');
        expect(screen.getByText('Team Mario')).toBeInTheDocument();
        expect(container.querySelector('.swiper')).not.toBeInTheDocument();
    });

    it('shows the games as swipers in the view of all games', () => {
        const { container } = render(<RoundDisplay round={formattedRound()} title="Aktuelle Spiele" user={makeUser({ teamId: 1 })} viewType="all" teamsNotInRound={[]} />);

        expect(container.querySelector('.swiper')).toBeInTheDocument();
    });

    it('says that no games were found when there is no round', () => {
        render(<RoundDisplay round={null} title="Nächstes Spiel" user={makeUser()} viewType="personal" teamsNotInRound={[]} />);

        expect(screen.getByRole('heading', { name: 'Nächstes Spiel' })).toBeInTheDocument();
        expect(screen.getByText('Keine Spiele gefunden.')).toBeInTheDocument();
    });

    it('announces pizza time during a break instead of listing games', () => {
        const { container } = render(<RoundDisplay round={makeBreak({ startTime: '18:30', endTime: '19:00' })} title="Aktuelles Spiel" user={makeUser()} viewType="personal" teamsNotInRound={[]} />);

        expect(screen.getByText(/pizza time/)).toBeInTheDocument();
        expect(container.querySelector('.timeStamp')).toHaveTextContent('18:30 - 19:00');
        expect(container.querySelector('.roundContainer')).not.toBeInTheDocument();
    });

    it('handles a round without a games list', () => {
        const round = { ...formattedRound(), games: undefined } as unknown as RoundReturnDTO;

        render(<RoundDisplay round={round} title="Aktuelles Spiel" user={makeUser()} viewType="personal" teamsNotInRound={[]} />);

        expect(screen.getByText('Du hast kein Spiel in dieser Runde.')).toBeInTheDocument();
    });

    it('shows four placeholder rows instead of the round while loading', () => {
        const { container } = render(<RoundDisplay round={formattedRound()} title="Aktuelles Spiel" user={makeUser()} viewType="personal" teamsNotInRound={[]} loading={true} />);

        expect(screen.queryByText('Aktuelles Spiel')).not.toBeInTheDocument();
        expect(screen.queryByText('Team Mario')).not.toBeInTheDocument();
        expect(container.querySelectorAll('.roundContainer .teamContainer')).toHaveLength(4);
    });

    it('shows swiper shaped placeholders while loading the view of all games', () => {
        const { container } = render(<RoundDisplay round={null} title="Aktuelle Spiele" user={makeUser()} viewType="all" teamsNotInRound={[]} loading={true} />);

        expect(container.querySelectorAll('.roundContainer .swiper-slide')).toHaveLength(4);
    });
});

describe('RoundHeader', () => {
    it('shows the title and lets the user choose between own and all games', () => {
        render(<RoundHeader title="Spielplan" onOptionChange={vi.fn()} selectedOption="Alle Spiele" loading={false} />);

        expect(screen.getByRole('heading', { name: 'Spielplan' })).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveValue('Alle Spiele');
        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Deine Spiele', 'Alle Spiele']);
    });

    it('reports a changed selection', () => {
        const onOptionChange = vi.fn();
        render(<RoundHeader title="Spielplan" onOptionChange={onOptionChange} selectedOption="Deine Spiele" loading={false} />);

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Alle Spiele' } });

        expect(onOptionChange).toHaveBeenCalledTimes(1);
    });

    it('hides the selection while loading', () => {
        render(<RoundHeader title="Spielplan" onOptionChange={vi.fn()} selectedOption="Deine Spiele" loading={true} />);

        expect(screen.getByRole('heading', { name: 'Spielplan' })).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});
