import React, {useEffect, useState} from 'react';
import {IonButton, IonContent, IonIcon, IonItem, IonModal, IonSelect, IonSelectOption, IonToast} from '@ionic/react';
import axios from "axios";
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import "../../interface/interfaces"
import {arrowForwardOutline} from "ionicons/icons";
import {changeQuestion, submitQuestion} from "../../util/service/surveyService";
import {QuestionType} from "../../util/service/util";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import SurveyAddModal from "./SurveyAddModal";
import {changeTeam, changeTeamNameAndCharacter, removeTeam} from "../../util/service/adminService";
import {CharacterReturnDTO, TeamReturnDTO} from "../../util/api/config/dto";
import {getAllAvailableCharacters} from "../../util/service/teamRegisterService";
import TeamChangeModal from "./TeamChangeModal";

const TeamDeleteModal:React.FC<{ showModal:boolean, closeModal: (team:TeamModalResult) => void, team: TeamReturnDTO}> = ({ showModal, closeModal, team }) => {

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const handleDeletion = async () => {
        try {
            await removeTeam(team);
            closeModal({teamDeleted: true});
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({teamDeleted: false})}>
            <IonContent>
                <h4>Team löschen</h4>
                <p> Willst du das Team <span>{team.teamName} </span> wirklich löschen?</p>
                <p> Diese Aktion kann nicht rückgängig gemacht werden.</p>
                
                    <div className={"playedContainer"}>
                        <IonButton className={"secondary round"} onClick={() => closeModal({teamDeleted: false})}
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           closeModal({teamDeleted: false});
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

export default TeamDeleteModal;
