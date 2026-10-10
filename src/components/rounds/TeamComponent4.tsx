import React from 'react';
import { GameReturnDTO, SwitchDTO, TeamReturnDTO } from "../../util/api/config/dto";
import { switchColorStyle } from '../../util/layout/switches';

const TeamComponent4: React.FC<{ team: TeamReturnDTO, game: GameReturnDTO, gameSwitch: SwitchDTO }> = ({ team, game, gameSwitch }) => {

    return (
        <div className="switchColored" style={switchColorStyle(gameSwitch.color)}>
            <div className="imageContainer switchColored" >
                <div className="round">
                    {game.teams.map(team => {
                        return (
                            <img
                                src={`/characters/${team.character.characterName}.png`}
                                alt="teamcharacter"
                                className="iconTeam"
                                key={team.character.characterName}
                            />
                        )
                    })}
                </div>
            </div>
            <div>
                <p>{team.teamName}</p>
                <p>Switch {gameSwitch.name}</p>
            </div>
        </div>
    );
};

export default TeamComponent4;
