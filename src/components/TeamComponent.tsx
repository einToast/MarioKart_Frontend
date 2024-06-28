const TeamComponent = ({ team, switchColor }) => {
    const character = team.character || [];

    return (
        <div className={`${switchColor}`}>
            <div className={`imageContainer ${switchColor}`}>
                <img
                    src={`../resources/media/${character}.png`}
                    alt="teamcharacter"
                    className="iconTeam"
                />
            </div>
            <div>
                <p>{team.name}</p>
                <p>Switch {switchColor}</p>
            </div>
        </div>
    );
};

export default TeamComponent;
