import React from 'react';
import { RoundReturnDTO } from '../../util/api/config/dto';
import { RoundDisplayProps } from '../../util/api/config/interfaces';
import { GameList } from './GameList';

export const RoundDisplay: React.FC<RoundDisplayProps> = ({
    round,
    title,
    user,
    viewType,
    noGames = false
}) => {
    if (noGames) {
        return (
            <div>
                <div className="timeContainer">
                    <h3>{title}</h3>
                </div>
                <p>Keine Spiele gefunden.</p>
            </div>
        );
    }

    if (!round) {
        return null;
    }

    const isBreak = 'breakEnded' in round;

    return (
        <div className="flexSpiel">
            <div className="timeContainer">
                <h3>{title}</h3>
                <p className="timeStamp">{round.startTime} - {round.endTime}</p>
            </div>

            {isBreak ? (
                <p>It&apos;s pizza time! 🍕</p>
            ) : (
                <GameList
                    games={(round as RoundReturnDTO).games || []}
                    user={user}
                    viewType={viewType}
                />
            )}
        </div>
    );
}; 