import React from 'react';
import { LinearGradient } from 'react-text-gradients';
import { RoundHeaderProps } from '../../util/api/config/interfaces';

export const RoundHeader: React.FC<RoundHeaderProps> = ({ title, onOptionChange, selectedOption }) => {
    return (
        <div className="flexStart">
            <h1>
                <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                    {title}
                </LinearGradient>
            </h1>
            <div>
                <select value={selectedOption} onChange={onOptionChange}>
                    <option>Deine Spiele</option>
                    <option>Alle Spiele</option>
                </select>
            </div>
        </div>
    );
}; 