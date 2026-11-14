import React from 'react';
import { LinearGradient } from 'react-text-gradients';
import { RoundHeaderProps } from '../../util/api/config/interfaces';
import { IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import SegmentedToggle from '../SegmentedToggle';

export const OWN_GAMES = 'Deine Spiele';
export const ALL_GAMES = 'Alle Spiele';

export const RoundHeader: React.FC<RoundHeaderProps> = ({ title, onOptionChange, selectedOption, loading }) => {
    const { t } = useTranslation();

    return (
        <div className="flexStart roundHeader">
            <h1>
                <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                    {title}
                </LinearGradient>
            </h1>
            {loading ? (
                <div >
                    <IonSkeletonText animated style={{ width: '190px', height: '30px', borderRadius: 6 }} />
                </div>
            ) : (
                <SegmentedToggle
                    options={[
                        { value: OWN_GAMES, label: t('schedule.ownGames') },
                        { value: ALL_GAMES, label: t('schedule.allGames') },
                    ]}
                    value={selectedOption}
                    onChange={onOptionChange}
                />
            )}
        </div>
    );
}; 