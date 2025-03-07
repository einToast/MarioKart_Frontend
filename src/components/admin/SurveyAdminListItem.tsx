import { IonIcon } from "@ionic/react";
import {
    chatboxEllipsesOutline,
    chatboxOutline,
    createOutline,
    eyeOffOutline,
    eyeOutline,
    statsChartOutline,
    trashOutline
} from "ionicons/icons";
import React from 'react';
import { SurveyAdminListItemProps } from "../../util/api/config/interfaces";

const SurveyAdminListItem: React.FC<SurveyAdminListItemProps> = ({
    survey,
    onToggleVisibility,
    onToggleActive,
    onOpenResultsModal,
    onOpenChangeModal,
    onOpenDeleteModal
}) => {
    return (
        <div className={`currentSurvey ${survey.visible ? 'active' : ''}`}>
            <p>{survey.questionText}</p>
            <div>
                <IonIcon
                    slot="end"
                    icon={statsChartOutline}
                    title="Ergebnisse anzeigen"
                    onClick={() => onOpenResultsModal(survey)}
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onOpenResultsModal(survey);
                        }
                    }}
                />
                <IonIcon
                    slot="end"
                    icon={createOutline}
                    title="Umfrage bearbeiten"
                    onClick={() => onOpenChangeModal(survey)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onOpenChangeModal(survey);
                        }
                    }}
                />
                <IonIcon
                    slot="end"
                    icon={survey.visible ? eyeOutline : eyeOffOutline}
                    title={survey.visible ? "Umfrage unsichtbar machen" : "Umfrage sichtbar machen"}
                    onClick={() => onToggleVisibility(survey.id)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onToggleVisibility(survey.id);
                        }
                    }}
                />
                <IonIcon
                    slot="end"
                    icon={survey.active ? chatboxEllipsesOutline : chatboxOutline}
                    title={survey.active ? "Teilnahme deaktivieren" : "Teilnahme aktivieren"}
                    onClick={() => onToggleActive(survey.id)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onToggleActive(survey.id);
                        }
                    }}
                />
                <IonIcon
                    slot="end"
                    icon={trashOutline}
                    title="Umfrage löschen"
                    onClick={() => onOpenDeleteModal(survey)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onOpenDeleteModal(survey);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default SurveyAdminListItem; 