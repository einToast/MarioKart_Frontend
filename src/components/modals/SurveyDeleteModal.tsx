import { IonButton, IonContent, IonIcon, IonModal, IonToast } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from 'react';
import { SurveyModalResult } from "../../util/api/config/interfaces";
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { errorToastColor } from "../../util/api/config/constants";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { getUser } from "../../util/service/loginService";
import { removeQuestion } from "../../util/service/surveyService";


const SurveyDeleteModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const handleDeletion = async () => {
        try {
            await removeQuestion(question);
            closeModal({ surveyDeleted: true });
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyDeleted: false })}>
            <IonContent>
                <h4>Umfrage löschen</h4>
                <p> Willst du die Umfrage <span>{question.questionText} </span> wirklich löschen?</p>
                <p> Diese Aktion kann nicht rückgängig gemacht werden.</p>

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
                            <p>Umfrage löschen</p>
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

export default SurveyDeleteModal;
