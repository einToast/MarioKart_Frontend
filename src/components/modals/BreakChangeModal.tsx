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
import {changeBreak, changeTeam, changeTeamNameAndCharacter} from "../../util/service/adminService";
import {
    BreakReturnDTO,
    CharacterReturnDTO,
    QuestionReturnDTO,
    RoundReturnDTO,
    TeamReturnDTO
} from "../../util/api/config/dto";
import {getAllAvailableCharacters} from "../../util/service/teamRegisterService";
import {getAllRounds} from "../../util/service/dashboardService";
import Dashboard from "../../pages/admin/Dashboard";
import {differenceInMinutes} from "date-fns";

const BreakChangeModal:React.FC<{ showModal:boolean, closeModal: (team:Object) => void, aBreak:BreakReturnDTO}> = ({ showModal, closeModal, aBreak }) => {

    const [breakDuration, setBreakDuration] = useState<number>(0);
    const [breakEnded, setBreakEnded] = useState<boolean>(false);
    const [beforeRound, setBeforeRound] = useState<number>(0);
    const [rounds, setRounds] = useState<RoundReturnDTO[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const resetBreak = () => {
        setBreakDuration(0);
        setBeforeRound(0);
    }

    const handleChange = async () => {
        try {
            const newTeam = await changeBreak(beforeRound, breakDuration, breakEnded);

            if (newTeam) {
                resetBreak();
                closeModal({breakChanged: true});
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }

    };

    const enterBreak = async () => {
        console.log(aBreak);
        setBreakDuration(differenceInMinutes(new Date(aBreak.endTime), new Date(aBreak.startTime)));
        setBreakEnded(aBreak.breakEnded);
        setBeforeRound(aBreak.round.id);
    }

    const getRounds = async () => {
        try {
            const rounds = await getAllRounds();
            console.log(rounds);
            setRounds(rounds);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }


    useEffect(() => {
        enterBreak()
        getRounds();
    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <h4>Team</h4>
                <form onSubmit={handleChange}>

                    <div className="borderContainer">
                        <p>Dauer der Pause</p>
                        <input
                            type="number"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                            placeholder={"Dauer der Pause"}
                            required
                        />
                    </div>
                    <div className={"borderContainer"}>
                        <p>Vor Runde</p>
                        <select value={beforeRound} onChange={(e) => setBeforeRound(parseInt(e.target.value))}
                                style={{cursor: "pointer"}}
                        >
                            {rounds.map((round, index) => (
                                <option value={round.id}
                                        key={index}
                                >
                                    {round.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={"borderContainer"}>
                        <p>Pause beendet</p>
                        <select value={breakEnded ? 1 : 0} onChange={(e) => setBreakEnded(e.target.value === '1')}
                                style={{cursor: "pointer"}}
                        >
                            <option value={0}>Nein</option>
                            <option value={1}>Ja</option>
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
                                <p>Pause ändern</p>
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

export default BreakChangeModal;