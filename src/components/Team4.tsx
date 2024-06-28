const TeamComponent4 = ({ team, game, switchColor }) => {
    const character = team.character || [];

    return (
        <div className={`${switchColor}`}>
            <div className={`imageContainer ${switchColor}`} >

                {game.teams.map(icon => {
                    return (
                        <img
                            src={`../resources/media/${icon.character}.png`}
                            alt="teamcharacter"
                            className="iconTeam"
                            key={icon.character}
                        />
                    )
                    })
                }
            </div>
            <div>
                <p>{team.name}</p>
                <p>Switch {switchColor}</p>
            </div>
        </div>
    );
};

export default TeamComponent4;
