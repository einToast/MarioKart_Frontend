// RoundComponentAll.tsx
import TeamComponent from './TeamComponent';
import {GameReturnDTO, TeamReturnDTO} from "../util/api/config/dto";

const RoundComponentAll: React.FC<{game:GameReturnDTO, user:any, switchColor:string}> = ({ game, user, switchColor }) => {
    if (!game || !game.teams) {

        return (
            <div>Du hast aktuell keine Spiele.</div>
        );
    }

    return (
        <div className="roundContainer" >
                {game.teams.map(team => {
                    return (
                        <div
                            key={team.id}
                            className={`teamContainer ${user.character === team.character.characterName ? 'userTeam' : ''} ${switchColor} slide`}
                            style={{opacity: team.active ? 1 : 0.5}}
                        >
                            <TeamComponent team={team} switchColor={switchColor} />
                        </div>
                    );
                })}
        </div>
    );
};

export default RoundComponentAll;
