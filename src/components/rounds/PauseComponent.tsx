import React from 'react';
import { TeamReturnDTO } from '../../util/api/config/dto';
import { PAUSE_COLOR, switchColorStyle } from '../../util/layout/switches';
import { useTranslation } from 'react-i18next';

const PauseComponent = ({ team }: { team: TeamReturnDTO }) => {
    const { t } = useTranslation();
    const character = team.character.characterName || [];

    return (
        <div className="switchColored" style={switchColorStyle(PAUSE_COLOR)}>
            <div className="imageContainer switchColored">
                <div className="pause">
                    <img
                        src={`/characters/${character}.webp`}
                        alt={team.character.characterName}
                        className="iconTeam"
                    />
                </div>
            </div>
            <div>
                <p>{team.teamName}</p>
                <p className="punkte">{t('schedule.pause')}</p>
            </div>
        </div >
    );
};

export default PauseComponent;
