import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast, IonAlert
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline} from 'ionicons/icons';
import {useHistory, useLocation} from "react-router";
import React, {useEffect, useState} from "react";

import {checkToken, getToken, getUser, removeToken} from "../../util/service/loginService";
import {checkFinalPlan, checkMatchPlan} from "../../util/api/MatchPlanApi";
import {
    checkFinal,
    checkMatch,
    deleteFinal,
    deleteMatch,
    deleteTeams,
    resetEverything
} from "../../util/service/adminService";

const Control: React.FC<LoginProps> = (props: LoginProps) => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>('#CD7070');
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const match = checkMatch();
        const final = checkFinal()

        match.then((result) => {
            setIsMatchPlan(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        });

        final.then((result) => {
            setIsFinalPlan(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        });

    }, [location]);

    const handleRegistration = async () => {
        console.log('Registrierung');
    }

    const handleTeamsDelete = async () => {
        try{
            await deleteTeams();
            setError('Teams erfolgreich gelöscht');
            setToastColor('#68964C');
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        }
    }

    const handleMatchPlanDelete = async () => {
        try {
            await deleteMatch();
            setError('Spielplan erfolgreich gelöscht');
            setToastColor('#68964C');
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        }
    }

    const handleFinalPlanDelete = async () => {
        try {
            await deleteFinal();
            setError('Finalspiele erfolgreich gelöscht');
            setToastColor('#68964C');
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        }
    }

    const handleReset = async () => {
        try {
            await resetEverything();
            setError('Anwendung erfolgreich zurückgesetzt');
            setToastColor('#68964C');
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <div className={"contentLogin"}>
                    <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                        <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                        <a>Zurück</a>
                    </div>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Kontrollzentrum
                        </LinearGradient>
                    </h2>
                    <div className={"adminDashboard"}>
                        {!isMatchPlan ?
                            <IonButton slot="start" onClick={handleRegistration}>
                                <div>
                                    <p>Registrierung</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isMatchPlan ?
                            <IonButton slot="start" onClick={handleTeamsDelete}>
                                <div>
                                    <p>Teams löschen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {isMatchPlan && !isFinalPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={handleMatchPlanDelete}>
                                <div>
                                    <p>Spielplan löschen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {isFinalPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={handleFinalPlanDelete}>
                                <div>
                                    <p>Finalspiele löschen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        <IonButton slot="start" className={"secondary"} onClick={handleReset}>
                            <div>
                                <p>Anwendung zurücksetzen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
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

export default Control;