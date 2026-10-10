import React from 'react';
import { TeamReturnDTO } from '../../util/api/config/dto';
import { PAUSE_COLOR, switchColorStyle } from '../../util/layout/switches';

const PauseComponent = ({ team }: { team: TeamReturnDTO }) => {
    const character = team.character.characterName || [];

    return (
        <div className="switchColored" style={switchColorStyle(PAUSE_COLOR)}>
            <div className="imageContainer switchColored">
                <div className="pause">
                    <img
                        src={`/characters/${character}.png`}
                        alt="teamcharacter"
                        className="iconTeam"
                    />
                </div>
            </div>
            <div>
                <p>{team.teamName}</p>
                <p className="punkte">Pause</p>
            </div>
        </div >
    );
};

export default PauseComponent;
