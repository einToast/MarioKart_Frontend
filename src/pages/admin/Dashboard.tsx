import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import Toast from "../../components/Toast";
import { PublicScheduleService } from "../../util/service";
import { PublicCookiesService } from "../../util/service";

const Dashboard: React.FC = () => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [isRoundsUnplayedZero, setIsRoundsUnplayedZero] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
    const location = useLocation();

    const handleLogout = () => {
        PublicCookiesService.removeToken();
        history.push('/admin/login');
    }

    useEffect(() => {
        if (!PublicCookiesService.checkToken()) {
            window.location.assign('/admin/login');
        }

        Promise.all([
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedZero()
        ])
            .then(([matchPlan, finalPlan, roundsZero]) => {
                setIsMatchPlan(matchPlan);
                setIsFinalPlan(finalPlan);
                setIsRoundsUnplayedZero(roundsZero);
            })
            .catch(error => {
                setError(error.message);
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
                        {!isFinalPlan && isMatchPlan && isRoundsUnplayedZero ?
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonPage>
    );
};

export default Dashboard;
