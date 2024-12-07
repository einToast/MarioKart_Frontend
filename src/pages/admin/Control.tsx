import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline} from 'ionicons/icons';
import {useHistory, useLocation} from "react-router";
import React, {useEffect, useState} from "react";

import {checkToken, getUser} from "../../util/service/loginService";
import {
    checkFinal,
    checkMatch,
    deleteFinal,
    deleteMatch,
    deleteTeams,
    resetEverything
} from "../../util/service/adminService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";

const Control: React.FC<LoginProps> = (props: LoginProps) => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
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
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        final.then((result) => {
            setIsFinalPlan(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

    }, [location]);

    const handleRegistration = async () => {
        console.log('Registrierung');
    }

    const handleTeamsDelete = async () => {
        try {
            await deleteTeams();
            setError('Teams erfolgreich gelöscht');
            setToastColor(successToastColor);
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleMatchPlanDelete = async () => {
        try {
            await deleteMatch();
            setError('Spielplan erfolgreich gelöscht');
            setToastColor(successToastColor);
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleFinalPlanDelete = async () => {
        try {
            await deleteFinal();
            setError('Finalspiele erfolgreich gelöscht');
            setToastColor(successToastColor);
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleReset = async () => {
        try {
            await resetEverything();
            setError('Anwendung erfolgreich zurückgesetzt');
            setToastColor(successToastColor);
            setShowToast(true);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
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
                        Kontrollzentrum
                    </LinearGradient>
                </h2>
                <div className={"adminDashboard"}>
                    {!isMatchPlan ?
                        <IonButton slot="start" className={"secondary"} onClick={handleRegistration}
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           handleRegistration();
                                       }
                                   }}
                        >
                            <div>
                                <p>Registrierung</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        : ''
                    }
                    {!isMatchPlan ?
                        <IonButton slot="start" className={"secondary"} onClick={handleTeamsDelete}
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           handleTeamsDelete();
                                       }
                                   }}
                        >
                            <div>
                                <p>Teams löschen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        : ''
                    }
                    {isMatchPlan && !isFinalPlan ?
                        <IonButton slot="start" className={"secondary"} onClick={handleMatchPlanDelete}
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           handleMatchPlanDelete();
                                       }
                                   }}
                        >
                            <div>
                                <p>Spielplan löschen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        : ''
                    }
                    {isFinalPlan ?
                        <IonButton slot="start" className={"secondary"} onClick={handleFinalPlanDelete}
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           handleFinalPlanDelete();
                                       }
                                   }}
                        >
                            <div>
                                <p>Finalspiele löschen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        : ''
                    }
                    <IonButton slot="start" className={"secondary"} onClick={handleReset}
                               tabIndex={0}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ' ') {
                                       handleReset();
                                   }
                               }}
                    >
                        <div>
                            <p>Anwendung zurücksetzen</p>
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
    );
};

export default Control;
