import React from 'react';
import { TeamReturnDTO } from '../../util/api/config/dto';

const PauseComponent = ({ team }: { team: TeamReturnDTO }) => {
    const character = team.character.characterName || [];

    return (
        <div className="gelb">
            <div className={`imageContainer gelb`}>
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
