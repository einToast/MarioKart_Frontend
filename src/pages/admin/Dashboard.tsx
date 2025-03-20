import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import { errorToastColor } from "../../util/api/config/constants";
import { PublicScheduleService, PublicUserService } from "../../util/service";

const Dashboard: React.FC = () => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [isRoundsUnplayedZero, setIsRoundsUnplayedZero] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    // TODO: user into useEffect (in every page)
    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    const handleLogout = () => {
        PublicUserService.removeToken();
        history.push('/admin/login');
    }

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }

        const match = PublicScheduleService.isMatchPlanCreated();
        const final = PublicScheduleService.isFinalPlanCreated();
        const isRoundsZero = PublicScheduleService.isNumberOfRoundsUnplayedZero();

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

        isRoundsZero.then((result) => {
            setIsRoundsUnplayedZero(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

    }, [location]);


    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Admin
                        </LinearGradient>
                    </h2>
                    <h1>Dashboard</h1>
                    <div className={"adminDashboard"}>
                        {isMatchPlan ?
                            <IonButton slot="start" onClick={() => history.push('/admin/points')}>
                                <div>
                                    <p>Punkte eintragen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isMatchPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/matchplan')}>
                                <div>
                                    <p>Spielplan erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isFinalPlan && isMatchPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/final')}>
                                <div>
                                    <p>Finalspiele erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {isMatchPlan && isRoundsUnplayedZero ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/results')}>
                                <div>
                                    {isFinalPlan ?
                                        <p>Endergebnis</p>
                                        :
                                        <p>Zwischenergebnis</p>
                                    }
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/teams')}>
                            <div>
                                <p>Teams</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/survey')}>
                            <div>
                                <p>Umfragen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/control')}>
                            <div>
                                <p>Kontrollzentrum</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={handleLogout}>
                            <div>
                                <p>Logout</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a onClick={() => history.push("/login")}
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                history.push('/login');
                            }
                        }}
                    >
                        Zurück zum Team Login
                    </a>
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

export default Dashboard;
