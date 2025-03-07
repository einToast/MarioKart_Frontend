import { IonIcon } from "@ionic/react";
import {
    addCircleOutline,
    createOutline,
    eyeOffOutline,
    eyeOutline,
    removeCircleOutline,
    trashOutline
} from 'ionicons/icons';
import React from 'react';
import { TeamAdminListItemProps } from "../../util/api/config/interfaces";

const TeamAdminListItem: React.FC<TeamAdminListItemProps> = ({
    team,
    matchplanCreated,
    onToggleFinalParticipation,
    onToggleActive,
    onOpenChangeModal,
    onOpenDeleteModal
}) => {
    return (
        <div className="teamContainer">
            <div className="imageContainer">
                <img
                    src={`/characters/${team.character?.characterName}.png`}
                    alt={team.character?.characterName}
                    className="iconTeam"
                />
            </div>
            <div className="stats">
                <p>{team.teamName}</p>
                <p className="punkte">{team.groupPoints} Punkte</p>
                <p className="punkte">{team.finalPoints} Finalpunkte</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <IonIcon
                    slot="end"
                    icon={createOutline}
                    title="Team bearbeiten"
                    style={{ cursor: "pointer" }}
                    onClick={() => onOpenChangeModal(team)}
                />
                <IonIcon
                    slot="end"
                    icon={team.finalReady ? removeCircleOutline : addCircleOutline}
                    title={team.finalReady ? "Team nicht am Finale teilnehmen lassen" : "Team am Finale teilnehmen lassen"}
                    style={{ cursor: "pointer" }}
                    onClick={() => onToggleFinalParticipation(team)}
                />
                <IonIcon
                    slot="end"
                    icon={team.active ? eyeOutline : eyeOffOutline}
                    title={team.active ? "Team deaktivieren" : "Team aktivieren"}
                    style={{ cursor: "pointer" }}
                    onClick={() => onToggleActive(team)}
                />
                {!matchplanCreated && (
                    <IonIcon
                        slot="end"
                        icon={trashOutline}
                        title="Team löschen"
                        style={{ cursor: "pointer" }}
                        onClick={() => onOpenDeleteModal(team)}
                    />
                )}
            </div>
        </div>
    );
};

export default TeamAdminListItem; 