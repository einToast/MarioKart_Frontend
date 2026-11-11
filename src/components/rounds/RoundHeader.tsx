import React from 'react';
import { LinearGradient } from 'react-text-gradients';
import { RoundHeaderProps } from '../../util/api/config/interfaces';
import { IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export const OWN_GAMES = 'Deine Spiele';
export const ALL_GAMES = 'Alle Spiele';

export const RoundHeader: React.FC<RoundHeaderProps> = ({ title, onOptionChange, selectedOption, loading }) => {
    const { t } = useTranslation();

    return (
        <div className="flexStart">
            <h1>
                <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                    {title}
                </LinearGradient>
            </h1>
            {loading ? (
                <div >
                    <IonSkeletonText animated style={{ width: '125px', height: '30px', borderRadius: 6 }} />
                </div>
            ) : (
                <div>
                    <select value={selectedOption} onChange={onOptionChange} >
                        <option value={OWN_GAMES}>{t('schedule.ownGames')}</option>
                        <option value={ALL_GAMES}>{t('schedule.allGames')}</option>
                    </select>
                </div>
            )}
        </div>
    );
}; 