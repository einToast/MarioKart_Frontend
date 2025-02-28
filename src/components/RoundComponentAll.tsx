import React from 'react';
import { User } from '../util/api/config/interfaces';
import { GameReturnDTO } from "../util/api/config/dto";
import TeamComponent from './TeamComponent';

const RoundComponentAll: React.FC<{ game: GameReturnDTO, user: User, switchColor: string }> = ({ game, user, switchColor }) => {

    if (!game || !game.teams) {
        return (
            <p>Du hast aktuell keine Spiele.</p>
        );
    }

    return (
        <div className="roundContainer" >
            {game.teams.map(team => {
                return (
                    <div
                        key={team.id}
                        className={`teamContainer ${user.character === team.character?.characterName ? 'userTeam' : ''} ${switchColor} slide`}
                        style={{ opacity: team.active ? 1 : 0.5 }}
                    >
                        <TeamComponent team={team} switchColor={switchColor} />
                    </div>
                );
            })}
        </div>
    );
};

export default RoundComponentAll;
