import React from 'react';
import { GameReturnDTO } from '../../util/api/config/dto';
import { GameListProps } from '../../util/api/config/interfaces';
import PauseComponentSwiper from './PauseComponentSwiper';
import RoundComponentAll from './RoundComponentAll';
import RoundComponentSwiper from './RoundComponentSwiper';

export const GameList: React.FC<GameListProps> = ({ games, user, viewType, teamsNotInRound }) => {
    const sortGamesForUser = (games: GameReturnDTO[]) => {

        const gamesWithSortedTeams = games.map(game => {
            const hasLoggedInCharacter = game.teams.some(team =>
                team.id === user?.teamId
            ) || false;

            if (hasLoggedInCharacter && game.teams) {
                const loggedInTeamIndex = game.teams.findIndex(team =>
                    team.id === user?.teamId
                );
                if (loggedInTeamIndex !== -1) {
                    const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                    game.teams.unshift(loggedInTeam[0]);
                }
            }

            return game;
        });

        return gamesWithSortedTeams.sort((a, b) => {
            const aHasUser = a.teams.some(team => team.id === user?.teamId) ? 1 : 0;
            const bHasUser = b.teams.some(team => team.id === user?.teamId) ? 1 : 0;
            return bHasUser - aHasUser;
        });
    };

    const filteredGames = viewType === 'personal'
        ? games.filter(game =>
            game.teams.some(team => team.id === user?.teamId) || false
        )
        : games;

    const sortedGames = sortGamesForUser(filteredGames);


    if (sortedGames.length === 0) {
        return (
            <p>Du hast kein Spiel.</p>
        );
    }

    return (
        <>
            {viewType === 'all' && teamsNotInRound.some(team => team.id === user?.teamId) && (
                <PauseComponentSwiper
                    teams={teamsNotInRound}
                    user={user}
                />
            )}
            {sortedGames.map(game => {
                const switchColor = game.switchGame;
                return viewType === 'all' ? (
                    <RoundComponentSwiper
                        key={game.id}
                        game={game}
                        user={user}
                        switchColor={switchColor}
                    />
                ) : (
                    <RoundComponentAll
                        key={game.id}
                        game={game}
                        user={user}
                        switchColor={switchColor}
                    />
                );
            })}
            {viewType === 'all' && !teamsNotInRound.some(team => team.id === user?.teamId) && teamsNotInRound.length > 0 && (
                <PauseComponentSwiper
                    teams={teamsNotInRound}
                    user={user}
                />
            )}
        </>
    );
};