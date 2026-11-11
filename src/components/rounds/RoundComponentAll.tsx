import React from 'react';
import { GameReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { User } from '../../util/api/config/interfaces';
import TeamComponent from './TeamComponent';
import { useTranslation } from 'react-i18next';

const RoundComponentAll: React.FC<{ game: GameReturnDTO, user: User | null, gameSwitch: SwitchDTO }> = ({ game, user, gameSwitch }) => {
    const { t } = useTranslation();

    if (!game?.teams) {
        return (
            <p>{t('schedule.noGamesCurrently')}</p>
        );
    }

    return (
        <div className="roundContainer" >
            {game.teams.map(team => {
                return (
                    <div
                        key={team.id}
                        className={`teamContainer ${team.id === user?.teamId ? 'userTeam' : ''} slide`}
                        style={{ opacity: team.active ? 1 : 0.5 }}
                    >
                        <TeamComponent team={team} gameSwitch={gameSwitch} />
                    </div>
                );
            })}
        </div>
    );
};

export default RoundComponentAll;
