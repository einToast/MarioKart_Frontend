import React from 'react';
import { GameReturnDTO, TeamReturnDTO } from "../../util/api/config/dto";

const TeamComponent4: React.FC<{ team: TeamReturnDTO, game: GameReturnDTO, switchColor: string }> = ({ team, game, switchColor }) => {

    const classColor = switchColor.toLowerCase();
    return (
        <div className={`${classColor}`}>
            <div className={`imageContainer ${classColor}`} >
                <div className="round">
                    {game.teams?.map(team => {
                        return (
                            <img
                                src={`/characters/${team.character?.characterName}.png`}
                                alt="teamcharacter"
                                className="iconTeam"
                                key={team.character?.characterName}
                            />
                        )
                    })}
                </div>
            </div>
            <div>
                <p>{team.teamName}</p>
                <p>Switch {switchColor}</p>
            </div>
        </div>
    );
};

export default TeamComponent4;
