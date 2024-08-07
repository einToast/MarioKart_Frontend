const TeamComponent4 = ({ team, game, switchColor }) => {
    const character = team.character.characterName || [];

    return (
        <div className={`${switchColor}`}>
            <div className={`imageContainer ${switchColor}`} >

                {game.teams.map(icon => {
                    return (
                        <img
                            src={`../resources/media/${icon.character.characterName}.png`}
                            alt="teamcharacter"
                            className="iconTeam"
                            key={icon.character.characterName}
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
