import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon, IonCheckbox, IonToast
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline, createOutline, eye, eyeOutline, removeCircleOutline, removeOutline, trashOutline} from 'ionicons/icons';
import "./Final.css"
import React, {useEffect, useState} from "react";
import {TeamReturnDTO} from "../../util/api/config/dto";
import {
    createTeamFinalPlan,
    getTeamFinalRanked,
    removeTeamFinalParticipation, resetAllTeamFinalParticipation,
} from "../../util/service/adminService";
import {useHistory} from "react-router";
import {checkToken, getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import { getAllTeams } from '../../util/service/teamRegisterService';
import final from "./Final";

const Teams: React.FC<LoginProps> = (props: LoginProps) => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();

    const handleTeamRemove = async (team: TeamReturnDTO) => {
        try {
            const removedTeam = await removeTeamFinalParticipation(team);
            if (removedTeam) {
                // setError('Team entfernt');
                // setToastColor(successToastColor);
                // setShowToast(true);
                await getFinalTeams();
            } else {
                throw new TypeError('Team konnte nicht entfernt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleTeamsReset = async () => {
        try {
            const teams = await resetAllTeamFinalParticipation();
            if (teams) {
                setError('Teams zurückgesetzt');
                setToastColor(successToastColor);
                setShowToast(true);
                await getFinalTeams();
            } else {
                throw new TypeError('Teams konnten nicht zurückgesetzt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const getTeams = async () => {
        const teamNames = getAllTeams();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        getTeams();
    }, [])

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>ACHTUNG!</LinearGradient>
                </h2>
                <p>Bist du dir sicher, dass du das Finalspiel erzeugen willst? Du hast danach nicht mehr die Möglichkeit
                    Rundenpunkte einzutragen.</p>
                <p className={"bold"}>Folgende Teams sind im Finale:</p>

                <div className={"teamFinalContainer"}>
                    {teams ? (
                        teams
                            .map((team, index) => (
                                    <div key={team.id} className={`teamContainer`}>
                                        <div className={"imageContainer"}>
                                            <img src={`../resources/media/${team.character.characterName}.png`} alt={team.character.characterName}
                                                 className={"iconTeam"}/>
                                        </div>
                                        <div>
                                            <p>{team.teamName}</p>
                                            <p className={"punkte"}>{index + 1}. Platz</p>
                                        </div>
                                        <div>
                                            <IonIcon slot="end"
                                                     icon={createOutline}
                                                     style={{cursor: "pointer"}}
                                                     onClick={() => handleTeamRemove(team)}
                                            ></IonIcon>
                                        </div>
                                    </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )
                    }
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default Teams;