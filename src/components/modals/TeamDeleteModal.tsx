import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService } from '../../util/service';
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';

const TeamDeleteModal: React.FC<{ showModal: boolean, closeModal: (team: TeamModalResult) => void, team: TeamReturnDTO }> = ({ showModal, closeModal, team }) => {
    const { t } = useTranslation();

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const handleDelete = () => {
        AdminRegistrationService.deleteTeam(team)
            .then(() => {
                return closeModal({ teamDeleted: true });
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ teamDeleted: false })}>
            <IonContent>
                <h4>{t('admin.teams.delete')}</h4>
                <p> {t('admin.teams.deleteConfirmBefore')} <span>{team.teamName} </span> {t('admin.teams.deleteConfirmAfter')}</p>
                <p> {t('common.irreversible')}</p>

                <div className={"playedContainer"}>
                    <IonButton className={"secondary round"} onClick={() => closeModal({ teamDeleted: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ teamDeleted: false });
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
                            <p>{t('admin.teams.delete')}</p>
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

export default TeamDeleteModal;
