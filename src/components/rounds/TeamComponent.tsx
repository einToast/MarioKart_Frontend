import React from 'react';
import { SwitchDTO, TeamReturnDTO } from '../../util/api/config/dto';
import { switchColorStyle } from '../../util/layout/switches';

const TeamComponent = ({ team, gameSwitch }: { team: TeamReturnDTO, gameSwitch: SwitchDTO }) => {
    const character = team.character.characterName;
    return (
        <div className="switchColored" style={switchColorStyle(gameSwitch.color)}>
            <div className="imageContainer switchColored">
                <img
                    src={`/characters/${character}.png`}
                    alt="teamcharacter"
                    className="iconTeam"
                />
            </div>
            <div>
                <p>{team.teamName}</p>
                <p className="punkte">Switch {gameSwitch.name}</p>
            </div>
        </div>
    );
};

export default TeamComponent;
