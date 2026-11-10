import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService } from '../../util/service';
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';

const SurveyDeleteModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const { t } = useTranslation();

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const handleDelete = () => {
        AdminSurveyService.deleteQuestion(question)
            .then(() => {
                return closeModal({ surveyDeleted: true });
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyDeleted: false })}>
            <IonContent>
                <h4>{t('admin.surveys.delete')}</h4>
                <p> {t('admin.surveys.deleteConfirmBefore')} <span>{question.questionText} </span> {t('admin.surveys.deleteConfirmAfter')}</p>
                <p> {t('common.irreversible')}</p>

                <div className={"playedContainer"}>
                    <IonButton className={"secondary round"} onClick={() => closeModal({ surveyDeleted: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ surveyDeleted: false });
                            }
                        }}
                    >
                        <div>
                            <p>{t('common.cancel')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleDelete}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleDelete();
                            }
                        }}
                    >

                        <div>
                            <p>{t('admin.surveys.delete')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>
    );
};

export default SurveyDeleteModal;
