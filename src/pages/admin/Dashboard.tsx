import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import Toast from "../../components/Toast";
import { PublicCookiesService, PublicScheduleService, PublicUserService } from "../../util/service";

const Dashboard: React.FC = () => {

    const [isSchedule, setIsSchedule] = useState<boolean>(false);
    const [isFinalSchedule, setIsFinalSchedule] = useState<boolean>(false);
    const [isRoundsUnplayedZero, setIsRoundsUnplayedZero] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await PublicUserService.logout();
        } finally {
            history.push('/admin/login');
        }
    }

    useEffect(() => {
        const loadDashboard = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            Promise.all([
                PublicScheduleService.isScheduleCreated(),
                PublicScheduleService.isFinalScheduleCreated(),
                PublicScheduleService.isNumberOfRoundsUnplayedZero()
            ])
                .then(([schedule, finalSchedule, roundsZero]) => {
                    setIsSchedule(schedule);
                    setIsFinalSchedule(finalSchedule);
                    setIsRoundsUnplayedZero(roundsZero);
                })
                .catch(error => {
                    setError(error.message);
                    setShowToast(true);
                });
        };

        loadDashboard();
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
                        {isSchedule ?
                            <IonButton slot="start" onClick={() => history.push('/admin/points')}>
                                <div>
                                    <p>Punkte eintragen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isSchedule ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/schedule')}>
                                <div>
                                    <p>Spielplan erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isFinalSchedule && isSchedule && isRoundsUnplayedZero ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/final')}>
                                <div>
                                    <p>Finalspiele erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {isSchedule && isRoundsUnplayedZero ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/results')}>
                                <div>
                                    {isFinalSchedule ?
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
