import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon, IonToast
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline, trashOutline} from 'ionicons/icons';
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

const Final: React.FC<LoginProps> = (props: LoginProps) => {

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

    const getFinalTeams = async () => {
        const teamNames = getTeamFinalRanked();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    const handleFinalCreation = async () => {
        try {
            const final = await createTeamFinalPlan();
            if (final) {
                setError('Finale erfolgreich erstellt');
                setToastColor(successToastColor);
                setShowToast(true);
                history.push('/admin/dashboard');
            } else {
                throw new TypeError('Finale konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        getFinalTeams();
    }, [])

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}
                     tabIndex={0}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             history.push('/admin/dashboard');
                         }
                     }}
                >
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
                            .map(team => (
                                // TODO: add image and points
                                <div key={team.id} className={"teamFinal"}>
                                    <h3>{team.teamName}</h3>
                                    <IonIcon slot="end"
                                             icon={trashOutline}
                                             style={{cursor: "pointer"}}
                                             onClick={() => handleTeamRemove(team)}
                                             tabIndex={0}
                                             onKeyDown={(e) => {
                                                 if (e.key === 'Enter' || e.key === ' ') {
                                                     handleTeamRemove(team);
                                                 }
                                             }}
                                    ></IonIcon>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )
                    }
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round secondary"}>
                        <div onClick={handleTeamsReset}
                             tabIndex={0}
                             onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                     handleTeamsReset();
                                 }
                             }}
                        >
                            <p>Teams zurücksetzen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={handleTeamsReset}
                                     tabIndex={0}
                                     onKeyDown={(e) => {
                                         if (e.key === 'Enter' || e.key === ' ') {
                                             handleTeamsReset();
                                         }
                                     }}
                            ></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" shape="round" className={"round"}>
                        <div onClick={handleFinalCreation}
                             tabIndex={0}
                             onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                     handleFinalCreation();
                                 }
                             }}
                        >
                            <p>Finale erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={handleFinalCreation}
                                     tabIndex={0}
                                     onKeyDown={(e) => {
                                         if (e.key === 'Enter' || e.key === ' ') {
                                             handleFinalCreation();
                                         }
                                     }}
                            ></IonIcon>
                        </div>
                    </IonButton>
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

export default Final;