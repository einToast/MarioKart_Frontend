import { IonButton, IonContent, IonIcon, IonModal, IonToast } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../interface/interfaces";
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { errorToastColor } from "../../util/api/config/constants";
import { changeService } from "../../util/service/adminService";
import { getUser } from "../../util/service/loginService";
import { getRegistrationOpen, getTournamentOpen } from "../../util/service/teamRegisterService";
import { ChangeType } from "../../util/service/util";

const TournamentModal: React.FC<{ showModal: boolean, closeModal: (changeT: ChangeType) => void, changeType: ChangeType }> = ({ showModal, closeModal, changeType }) => {

    const [message, setMessage] = useState<string>('');
    const [secondaryMessage, setSecondaryMessage] = useState<string>('');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
    const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);


    const user = getUser();

    const handleChange = async () => {
        try {
            await changeService(changeType);
            closeModal(changeType);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const changeMessage = () => {
        const message_template = "Willst du wirklich <span>___</span> ...?";

        switch (changeType) {
            case ChangeType.TOURNAMENT:
                setMessage(message_template.replace('___', 'das Turnier'));
                setSecondaryMessage((isTournamentOpen ? 'schließen' : 'öffnen'));
                break;
            case ChangeType.REGISTRATION:
                setMessage(message_template.replace('___', 'die Registrierung'));
                setSecondaryMessage((isRegistrationOpen ? 'schließen' : 'öffnen'));
                break;
            case ChangeType.SURVEYS:
                setMessage(message_template.replace('___', 'alle Umfragen'));
                setSecondaryMessage('löschen');
                break;
            case ChangeType.TEAMS:
                setMessage(message_template.replace('___', 'alle Teams'));
                setSecondaryMessage('löschen');
                break;
            case ChangeType.MATCH_PLAN:
                setMessage(message_template.replace('___', 'den Spielplan'));
                setSecondaryMessage('löschen');
                break;
            case ChangeType.FINAL_PLAN:
                setMessage(message_template.replace('___', 'die Finalspiele'));
                setSecondaryMessage('löschen');
                break;
            case ChangeType.ALL:
                setMessage(message_template.replace('___', 'ALLES'));
                setSecondaryMessage('zurücksetzen');
                break;
            default:
                setMessage('Error');
                setSecondaryMessage('Error');
                break;
        }
    }


    useEffect(() => {
        const registrationOpen = getRegistrationOpen();
        const tournamentOpen = getTournamentOpen();

        registrationOpen.then((response) => {
            setIsRegistrationOpen(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        tournamentOpen.then((response) => {
            setIsTournamentOpen(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        changeMessage();

    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal()}>
            <IonContent>
                <h4>{changeType} {secondaryMessage}</h4>
                <p dangerouslySetInnerHTML={{ __html: message.replace('...', secondaryMessage) }}></p>
                {(changeType !== ChangeType.TOURNAMENT && changeType !== ChangeType.REGISTRATION) &&
                    <p> Diese Aktion kann nicht rückgängig gemacht werden.</p>
                }

                <div className={"playedContainer"}>
                    <IonButton className={"secondary round"} onClick={() => closeModal()}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal();
                            }
                        }}
                    >
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleChange}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleChange();
                            }
                        }}
                    >

                        <div>
                            <p>{changeType} {secondaryMessage}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonModal>
    );
};

export default TournamentModal;
