import React from 'react';
import { GameReturnDTO } from '../../util/api/config/dto';
import { GameListProps } from '../../util/api/config/interfaces';
import { resolveSwitch } from '../../util/layout/switches';
import PauseComponentAll from './PauseComponentAll';
import PauseComponentSwiper from './PauseComponentSwiper';
import RoundComponentAll from './RoundComponentAll';
import RoundComponentSwiper from './RoundComponentSwiper';

export const GameList: React.FC<GameListProps> = ({ games, user, viewType, teamsNotInRound, switches }) => {
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
        const teamOfUser = teamsNotInRound.find(team => team.id === user?.teamId);
        if (teamOfUser) {
            return (
                <PauseComponentAll
                    team={teamOfUser}
                />
            );
        } else {
            return (
                <p>Du hast kein Spiel in dieser Runde.</p>
            );
        }
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
                const gameSwitch = resolveSwitch(switches, game.switchIndex);
                return viewType === 'all' ? (
                    <RoundComponentSwiper
                        key={game.id}
                        game={game}
                        user={user}
                        gameSwitch={gameSwitch}
                    />
                ) : (
                    <RoundComponentAll
                        key={game.id}
                        game={game}
                        user={user}
                        gameSwitch={gameSwitch}
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