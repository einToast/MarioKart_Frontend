import React from "react";
import { TeamReturnDTO } from "../../util/api/config/dto";
import PauseComponent from "./PauseComponent";

const PauseComponentAll = ({ team }: { team: TeamReturnDTO }) => {

    return (
        <div className="roundContainer" >
            <div
                key={team.id}
                className={`teamContainer userTeam gelb slide`}
                style={{ opacity: team.active ? 1 : 0.5 }}
            >
                <PauseComponent team={team} />
            </div>
        </div>
    );
}

export default PauseComponentAll;