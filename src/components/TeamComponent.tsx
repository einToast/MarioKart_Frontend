const TeamComponent = ({ team, switchColor }) => {
    const character = team.character.characterName || [];

    return (
        <div className={`${switchColor}`}>
            <div className={`imageContainer ${switchColor}`}>
                <img
                    src={`/characters/${character}.png`}
                    alt="teamcharacter"
                    className="iconTeam"
                />
            </div>
            <div>
                <p>{team.teamName}</p>
                <p className="punkte">Switch {switchColor}</p>
            </div>
        </div>
    );
};

export default TeamComponent;
