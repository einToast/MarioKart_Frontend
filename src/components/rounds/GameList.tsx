import React from 'react';
import { GameReturnDTO } from '../../util/api/config/dto';
import { GameListProps } from '../../util/api/config/interfaces';
import PauseComponentSwiper from './PauseComponentSwiper';
import RoundComponentAll from './RoundComponentAll';
import RoundComponentSwiper from './RoundComponentSwiper';

export const GameList: React.FC<GameListProps> = ({ games, user, viewType, teamsNotInRound }) => {
    const sortGamesForUser = (games: GameReturnDTO[]) => {
        return games.map(game => {
            const hasLoggedInCharacter = game.teams.some(team =>
                team.character.characterName === user?.character
            ) || false;

            if (hasLoggedInCharacter && game.teams) {
                const loggedInTeamIndex = game.teams.findIndex(team =>
                    team.character.characterName === user?.character
                );
                if (loggedInTeamIndex !== -1) {
                    const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                    game.teams.unshift(loggedInTeam[0]);
                }
            }

            return game;
        });
    };

    const filteredGames = viewType === 'personal'
        ? games.filter(game =>
            game.teams.some(team => team.character.characterName === user?.character) || false
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
            {viewType === 'all' && teamsNotInRound.length > 0 && (
                // TODO: Own Team first
                <PauseComponentSwiper
                    teams={teamsNotInRound}
                    user={user}
                />
            )}
        </>
    );
}; 