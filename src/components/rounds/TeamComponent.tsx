import React from 'react';
import { SwitchDTO, TeamReturnDTO } from '../../util/api/config/dto';
import { switchColorStyle } from '../../util/layout/switches';
import { useTranslation } from 'react-i18next';

const TeamComponent = ({ team, gameSwitch }: { team: TeamReturnDTO, gameSwitch: SwitchDTO }) => {
    const { t } = useTranslation();
    const character = team.character.characterName;
    return (
        <div className="switchColored" style={switchColorStyle(gameSwitch.color)}>
            <div className="imageContainer switchColored">
                <img
                    src={`/characters/${character}.webp`}
                    alt={character}
                    className="iconTeam"
                />
            </div>
            <div>
                <p>{team.teamName}</p>
                <p className="punkte">{t('schedule.switchName', { name: gameSwitch.name })}</p>
            </div>
        </div>
    );
};

export default TeamComponent;
