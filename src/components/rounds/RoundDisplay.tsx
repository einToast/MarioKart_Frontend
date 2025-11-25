import React from 'react';
import { RoundReturnDTO } from '../../util/api/config/dto';
import { RoundDisplayProps } from '../../util/api/config/interfaces';
import { GameList } from './GameList';
import { IonSkeletonText } from '@ionic/react';
import SkeletonRoundComponentAll from './SkeletonRoundComponentAll';

export const RoundDisplay: React.FC<RoundDisplayProps> = ({
    round,
    title,
    user,
    viewType,
    teamsNotInRound,
    loading
}) => {

    if (loading) {
        return (
            <div className="flexSpiel">
                <div className="timeContainer" style={{ alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>
                        <IonSkeletonText animated style={{ width: 170, height: 30, borderRadius: 6 }} />
                    </h3>
                    <IonSkeletonText animated style={{ width: 120, height: 30, borderRadius: 12 }} />
                </div>
                <SkeletonRoundComponentAll isSwiper={viewType === 'all'} rows={4} />
            </div>
        );
    }

    if (!round) {
        return (
            <div>
                <div className="timeContainer">
                    <h3>{title}</h3>
                </div>
                <p>Keine Spiele gefunden.</p>
            </div>
        );
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
                    teamsNotInRound={teamsNotInRound}
                />
            )}
        </div>
    );
}; 
