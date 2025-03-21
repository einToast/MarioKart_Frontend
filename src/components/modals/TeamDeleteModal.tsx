import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService, PublicUserService } from '../../util/service';
import Toast from '../Toast';

const TeamDeleteModal: React.FC<{ showModal: boolean, closeModal: (team: TeamModalResult) => void, team: TeamReturnDTO }> = ({ showModal, closeModal, team }) => {

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

    const handleDeletion = async () => {
        try {
            await AdminRegistrationService.deleteTeam(team);
            closeModal({ teamDeleted: true });
        } catch (error) {
            setError(error.message);
            setShowToast(true);
        }
    }

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ teamDeleted: false })}>
            <IonContent>
                <h4>Team löschen</h4>
                <p> Willst du das Team <span>{team.teamName} </span> wirklich löschen?</p>
                <p> Diese Aktion kann nicht rückgängig gemacht werden.</p>

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
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleDeletion}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleDeletion();
                            }
                        }}
                    >

                        <div>
                            <p>Team löschen</p>
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
