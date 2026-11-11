import { IonIcon } from "@ionic/react";
import {
    barChartOutline,
    chatboxEllipsesOutline,
    chatboxOutline,
    createOutline,
    eyeOffOutline,
    eyeOutline,
    keyOutline,
    statsChartOutline,
    trashOutline
} from "ionicons/icons";
import React from 'react';
import { SurveyAdminListItemProps } from "../../util/api/config/interfaces";
import { QuestionType } from "../../util/service";
import { useTranslation } from 'react-i18next';

const SurveyAdminListItem: React.FC<SurveyAdminListItemProps> = ({
    survey,
    onToggleVisibility,
    onToggleActive,
    onOpenAnswerModal,
    onOpenStatisticsModal,
    onOpenChangeModal,
    onOpenDeleteModal
}) => {
    const { t } = useTranslation();
    return (
        <div className={`currentSurvey ${survey.visible ? 'active' : ''}`}>
            <p>
                {survey.questionText}
                {survey.oneAnswerPerKey && (
                    <IonIcon
                        icon={keyOutline}
                        title={t('admin.surveys.oneAnswerPerKey')}
                        className="oneAnswerPerKeyIcon"
                    />
                )}
            </p>
            <div>
                <IonIcon
                    slot="end"
                    icon={statsChartOutline}
                    title={t('admin.surveys.showResults')}
                    onClick={() => onOpenAnswerModal(survey)}
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onOpenAnswerModal(survey);
                        }
                    }}
                />
                {survey.questionType !== QuestionType.FREE_TEXT &&
                    survey.questionType !== QuestionType.TEAM_ONE_FREE_TEXT && (
                        <IonIcon
                            slot="end"
                            icon={barChartOutline}
                            title={t('admin.surveys.showGraph')}
                            onClick={() => onOpenStatisticsModal(survey)}
                            style={{ cursor: 'pointer', marginRight: '10px' }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onOpenStatisticsModal(survey);
                                }
                            }}
                        />
                    )}
                <IonIcon
                    slot="end"
                    icon={createOutline}
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
                    title={survey.visible ? t('admin.surveys.hide') : t('admin.surveys.show')}
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
                    title={survey.active ? t('admin.surveys.deactivate') : t('admin.surveys.activate')}
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
                    title={t('admin.surveys.delete')}
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