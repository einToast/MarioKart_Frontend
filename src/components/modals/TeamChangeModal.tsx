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
import {set} from "js-cookie";
import {changeTeam, changeTeamNameAndCharacter} from "../../util/service/adminService";
import {CharacterReturnDTO, QuestionReturnDTO, TeamReturnDTO} from "../../util/api/config/dto";
import {getAllAvailableCharacters} from "../../util/service/teamRegisterService";

const TeamChangeModal:React.FC<{ showModal:boolean, closeModal: (team:Object) => void, team: TeamReturnDTO}> = ({ showModal, closeModal, team }) => {

    const [teamName, setTeamName] = useState<string>('');
    const [character, setCharacter] = useState<string>('');
    const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const resetTeam = () => {
        setTeamName('');
    }

    const handleChange = async () => {
        try {
            const newTeam = await changeTeamNameAndCharacter(team, teamName, character);

            if (newTeam) {
                resetTeam();
                closeModal({teamChanged: true});
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }

    };

    const getCharacterNames = () => {
        const allCharacters = getAllAvailableCharacters()

        allCharacters.then((response) => {
            setAvailableCharacters(response.map(character => character.characterName));
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        } );
    };

    useEffect(() => {
        setTeamName(team.teamName);
        setCharacter(team.character.characterName);
        getCharacterNames();
    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <h4>Team</h4>
                <form onSubmit={handleChange}>

                    <div className="borderContainer">
                        <p>Teamname</p>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Frage eingeben"
                            required
                        />
                    </div>
                        <div className={"borderContainer"}>
                            <p>Charakter</p>
                            <select value={character} onChange={(e) => setCharacter(e.target.value)}
                                    style={{cursor: "pointer"}}>
                                <option
                                    value={character}
                                >
                                    {character}
                                </option>
                                {availableCharacters && availableCharacters.map((character) => (
                                    <option
                                        key={character}
                                        value={character}
                                    >
                                        {character}
                                    </option>
                                ))}
                            </select>
                        </div>
                </form>
                    <div className={"playedContainer"}>

                        <IonButton className={"secondary round"} onClick={closeModal}
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
                                <p>Team ändern</p>
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

export default TeamChangeModal;