// RoundComponentAll.tsx
import TeamComponent from './TeamComponent';

const RoundComponentAll = ({ game, user, switchColor }) => {
    if (!game || !game.teams) {
        console.log("Keine Spiele aktuell");

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
                        >
                            <TeamComponent team={team} switchColor={switchColor} />
                        </div>
                    );
                })}
        </div>
    );
};

export default RoundComponentAll;
