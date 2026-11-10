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
import { useTranslation } from 'react-i18next';

const TeamAdminListItem: React.FC<TeamAdminListItemProps> = ({
    team,
    scheduleCreated,
    finalScheduleCreated,
    onToggleFinalParticipation,
    onToggleActive,
    onOpenChangeModal,
    onOpenDeleteModal
}) => {
    const { t } = useTranslation();
    return (
        <div className="teamContainer">
            <div className="imageContainer">
                <img
                    src={`/characters/${team.character.characterName}.webp`}
                    alt={team.character.characterName}
                    className="iconTeam"
                />
            </div>
            <div className="stats">
                <p>{team.teamName}</p>
                <p className="punkte">{t('admin.teams.groupPoints', { count: team.groupPoints })}</p>
                <p className="punkte">{t('admin.teams.finalPoints', { count: team.finalPoints })}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <IonIcon
                    slot="end"
                    icon={createOutline}
                    title={t('admin.teams.edit')}
                    style={{ cursor: "pointer" }}
                    onClick={() => onOpenChangeModal(team)}
                />
                {!finalScheduleCreated && (
                    <>
                        <IonIcon
                            slot="end"
                            icon={team.finalReady ? removeCircleOutline : addCircleOutline}
                            title={team.finalReady ? t('admin.teams.excludeFromFinal') : t('admin.teams.includeInFinal')}
                            style={{ cursor: "pointer" }}
                            onClick={() => onToggleFinalParticipation(team)}
                        />
                        <IonIcon
                            slot="end"
                            icon={team.active ? eyeOutline : eyeOffOutline}
                            title={team.active ? t('admin.teams.deactivate') : t('admin.teams.activate')}
                            style={{ cursor: "pointer" }}
                            onClick={() => onToggleActive(team)}
                        />
                    </>
                )}

                {!scheduleCreated && (
                    <IonIcon
                        slot="end"
                        icon={trashOutline}
                        title={t('admin.teams.delete')}
                        style={{ cursor: "pointer" }}
                        onClick={() => onOpenDeleteModal(team)}
                    />
                )}
            </div>
        </div>
    );
};

export default TeamAdminListItem; 