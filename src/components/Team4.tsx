import {GameReturnDTO, TeamReturnDTO} from "../util/api/config/dto";

const TeamComponent4: React.FC<{team:TeamReturnDTO, game:GameReturnDTO, switchColor:string}> = ({ team, game, switchColor }) => {
    const character = team.character.characterName || [];

    return (
        <div className={`${switchColor}`}>
            <div className={`imageContainer ${switchColor}`} >

                {game.teams.map(team => {
                    return (
                        <img
                            src={`../resources/media/${team.character.characterName}.png`}
                            alt="teamcharacter"
                            className="iconTeam"
                            key={team.character.characterName}
                        />
                    )
                    })
                }
            </div>
            <div>
                <p>{team.teamName}</p>
                <p>Switch {switchColor}</p>
            </div>
        </div>
    );
};

export default TeamComponent4;
