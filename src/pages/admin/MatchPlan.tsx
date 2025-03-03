import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { createTeamMatchPlan, getRegisteredTeams } from "../../util/service/adminService";
import { checkToken, getUser } from "../../util/service/loginService";
import '../RegisterTeam.css';
import "./Points.css";


const MatchPlan: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const teamNames = getRegisteredTeams();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }, [location]);

    const handleMatchPlanCreation = async () => {
        try {
            setButtonDisabled(true);
            const newRounds = await createTeamMatchPlan();
            if (newRounds) {
                setError('Spielplan erfolgreich erstellt');
                setToastColor(successToastColor);
                setShowToast(true);
                history.push('/admin/dashboard');
            } else {
                throw new TypeError('Spielplan konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        } finally {
            setButtonDisabled(false);
        }

    }

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
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Spielplan erstellen
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"} style={{ paddingBottom: "50px" }}>
                    {teams ? (
                        teams
                            .map(team => (
                                <div key={team.id}
                                    className={`teamContainer`}>
                                    <div className={"imageContainer"}>
                                        <img src={`/characters/${team.character?.characterName}.png`}
                                            alt={team.character?.characterName}
                                            className={"iconTeam"} />
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        {/*<p className={"punkte"}>{team.finalPoints} Punkte</p>*/}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled}>
                        <div onClick={handleMatchPlanCreation}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleMatchPlanCreation();
                                }
                            }}
                        >
                            <p>Spielplan erzeugen</p>
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
        </IonPage>
    )
        ;
};

export default MatchPlan;
