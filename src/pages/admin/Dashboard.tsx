import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import Toast from "../../components/Toast";
import { PublicCookiesService, PublicScheduleService, PublicUserService } from "../../util/service";
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();

    const [isSchedule, setIsSchedule] = useState<boolean>(false);
    const [isFinalSchedule, setIsFinalSchedule] = useState<boolean>(false);
    const [isRoundsUnplayedZero, setIsRoundsUnplayedZero] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await PublicUserService.logout();
            navigate('/admin/login');
        } catch (error) {
            setError(error instanceof Error ? error.message : t('errors.logoutFailed'));
            setShowToast(true);
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

        loadDashboard().catch(error => {
            setError(error.message);
            setShowToast(true);
        });
    }, [location]);


    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <div slot="fixed" className="languageSwitchCorner">
                    <LanguageSwitch />
                </div>
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            {t('admin.title')}
                        </LinearGradient>
                    </h2>
                    <h1>{t('admin.dashboard.title')}</h1>
                    <div className={"adminDashboard"}>
                        {isSchedule ?
                            <IonButton slot="start" onClick={() => navigate('/admin/points')}>
                                <div>
                                    <p>{t('admin.dashboard.points')}</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isSchedule ?
                            <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/schedule')}>
                                <div>
                                    <p>{t('admin.dashboard.schedule')}</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {!isFinalSchedule && isSchedule && isRoundsUnplayedZero ?
                            <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/final')}>
                                <div>
                                    <p>{t('admin.dashboard.final')}</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        {isSchedule && isRoundsUnplayedZero ?
                            <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/results')}>
                                <div>
                                    {isFinalSchedule ?
                                        <p>{t('admin.results.final')}</p>
                                        :
                                        <p>{t('admin.results.intermediate')}</p>
                                    }
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/teams')}>
                            <div>
                                <p>{t('admin.dashboard.teams')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/survey')}>
                            <div>
                                <p>{t('admin.dashboard.surveys')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/venue')}>
                            <div>
                                <p>{t('admin.venue.title')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/program')}>
                            <div>
                                <p>{t('admin.program.title')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => navigate('/admin/control')}>
                            <div>
                                <p>{t('admin.control.title')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={handleLogout}>
                            <div>
                                <p>{t('admin.dashboard.logout')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <Link to="/login" style={{ textDecoration: "underline" }}>
                        {t('admin.backToTeamLogin')}
                    </Link>
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
