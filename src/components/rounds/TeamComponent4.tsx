import React from 'react';
import { GameReturnDTO, SwitchDTO, TeamReturnDTO } from "../../util/api/config/dto";
import { switchColorStyle } from '../../util/layout/switches';

// Up to four characters keep their full size, more of them have to shrink to fit
const FULL_SIZE_TEAMS = 4;
const CIRCLE_CENTRE = { x: 80, y: 55 };
const CIRCLE_RADIUS = 30;
const ICON_SIZE = 35;
const CROWDED_ICON_SIZE = 28;

// The characters are spread evenly around the switch circle, starting at the top
const iconStyle = (index: number, count: number): React.CSSProperties => {
    const size = count > FULL_SIZE_TEAMS ? CROWDED_ICON_SIZE : ICON_SIZE;
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    return {
        left: Math.round(CIRCLE_CENTRE.x + CIRCLE_RADIUS * Math.cos(angle) - size / 2),
        top: Math.round(CIRCLE_CENTRE.y + CIRCLE_RADIUS * Math.sin(angle) - size / 2),
    };
};

const TeamComponent4: React.FC<{ team: TeamReturnDTO, game: GameReturnDTO, gameSwitch: SwitchDTO }> = ({ team, game, gameSwitch }) => {
    const crowded = game.teams.length > FULL_SIZE_TEAMS;

    return (
        <div className="switchColored" style={switchColorStyle(gameSwitch.color)}>
            <div className="imageContainer switchColored" >
                <div className={crowded ? 'round crowded' : 'round'}>
                    {game.teams.map((team, index) => {
                        return (
                            <img
                                src={`/characters/${team.character.characterName}.png`}
                                alt="teamcharacter"
                                className="iconTeam"
                                key={team.character.characterName}
                                style={iconStyle(index, game.teams.length)}
                            />
                        )
                    })}
                </div>
            </div>
            <div>
                <p>{team.teamName}</p>
                <p>Switch {gameSwitch.name}</p>
            </div>
        </div>
    );
};

export default TeamComponent4;
