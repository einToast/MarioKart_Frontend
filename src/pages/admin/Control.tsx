import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import BackLink from "../../components/admin/BackLink";
import BreakChangeModal from "../../components/modals/BreakChangeModal";
import NotificationModal from "../../components/modals/NotificationModal";
import OcrConfigModal from "../../components/modals/OcrConfigModal";
import TournamentModal from "../../components/modals/TournamentModal";
import Toast from "../../components/Toast";
import { BreakReturnDTO, TeamReturnDTO } from "../../util/api/config/dto";
import { BreakModalResult, NotificationModalResult, OcrConfigModalResult, ChangeType } from "../../util/api/config/interfaces";
import { AdminRegistrationService, AdminScheduleService, PublicCookiesService, PublicScheduleService, PublicSettingsService } from "../../util/service";
import { useTranslation } from 'react-i18next';

const Control: React.FC = () => {
    const { t } = useTranslation();

    const [isSchedule, setIsSchedule] = useState<boolean>(false);
    const [isFinalSchedule, setIsFinalSchedule] = useState<boolean>(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
    const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
    const [aBreak, setABreak] = useState<BreakReturnDTO>({ id: 0, startTime: '', endTime: '', breakEnded: false, round: undefined });
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [deleteType, setDeleteType] = useState<ChangeType>(ChangeType.SCHEDULE);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showBreakModal, setShowBreakModal] = useState<boolean>(false);
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
    const [showOcrConfigModal, setShowOcrConfigModal] = useState<boolean>(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const handleOpenModal = (deleteType: ChangeType) => {
        setDeleteType(deleteType);
        setShowModal(true);
    }

    const handleOpenBreakModal = () => {
        const breakData = AdminScheduleService.getBreak();
        breakData.then((result) => {
            setABreak(result);
            setShowBreakModal(true);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }

    const handleOpenNotificationModal = () => {
        const teams = AdminRegistrationService.getTeamsSortedByFinalPoints();
        teams.then((result) => {
            // sort by alphabetical order
            setTeams([...result].sort((a, b) => a.teamName.localeCompare(b.teamName)));
            setShowNotificationModal(true);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });


    }


    const closeModal = (changeT?: ChangeType) => {
        setModalClosed(prev => !prev);
        if (typeof changeT !== 'string') {
            return;
        }

        setIsError(false);
        switch (changeT) {
            case ChangeType.TOURNAMENT:
                setError(isTournamentOpen ? t('admin.control.tournamentClosed') : t('admin.control.tournamentOpened'));
                break;
            case ChangeType.REGISTRATION:
                setError(isRegistrationOpen ? t('admin.control.registrationClosed') : t('admin.control.registrationOpened'));
                break;
            case ChangeType.SURVEYS:
                setError(t('admin.control.surveysDeleted'));
                break;
            case ChangeType.TEAMS:
                setError(t('admin.control.teamsDeleted'));
                break;
            case ChangeType.SCHEDULE:
                setError(t('admin.control.scheduleDeleted'));
                break;
            case ChangeType.FINAL_SCHEDULE:
                setError(t('admin.control.finalDeleted'));
                break;
            case ChangeType.NOTIFICATIONS:
                setError(t('admin.control.subscriptionsDeleted'));
                break;
            case ChangeType.ALL:
                setError(t('admin.control.reset'));
                break;
            default:
                setError(t('errors.unknown'));
                setIsError(true);
                break;
        }
        setShowToast(true);
    };

    const closeBreakModal = (changeBreak: BreakModalResult) => {
        setModalClosed(prev => !prev);

        if (changeBreak.breakChanged) {
            setError(t('admin.control.breakChanged'));
            setIsError(false);
            setShowToast(true);
        }
    }

    const closeNotificationModal = (notify: NotificationModalResult) => {
        setModalClosed(prev => !prev);
        if (notify.notificationSent) {
            setError(t('admin.control.notificationSent'));
            setIsError(false);
            setShowToast(true);
        }
    }

    const closeOcrConfigModal = (result: OcrConfigModalResult) => {
        if (result.ocrConfigChanged) {
            setError(t('admin.control.ocrConfigured'));
            setIsError(false);
            setShowToast(true);
        }
    }

    useEffect(() => {
        const loadControlData = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            Promise.all([
                PublicScheduleService.isScheduleCreated(),
                PublicScheduleService.isFinalScheduleCreated(),
                PublicSettingsService.getRegistrationOpen(),
                PublicSettingsService.getTournamentOpen(),
            ])
                .then(([schedule, finalSchedule, registrationOpen, tournamentOpen]) => {
                    setIsSchedule(schedule);
                    setIsFinalSchedule(finalSchedule);
                    setIsRegistrationOpen(registrationOpen);
                    setIsTournamentOpen(tournamentOpen);
                })
                .catch(error => {
                    setError(error.message);
                    setIsError(true);
                    setShowToast(true);
                });
        };

        loadControlData().catch(error => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        {t('admin.control.title')}
                    </LinearGradient>
                </h2>
                <div className={"adminDashboard"}>
                    {(isSchedule &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenBreakModal()}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenBreakModal();
                                }
                            }}
                        >
                            <div>
                                <p>{t('admin.break.change')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.TOURNAMENT)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenModal(ChangeType.TOURNAMENT);
                            }
                        }}
                    >
                        <div>
                            <p>{isTournamentOpen ? t('admin.control.closeTournament') : t('admin.control.openTournament')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>

                    {(!isSchedule &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.REGISTRATION)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.REGISTRATION);
                                }
                            }}
                        >
                            <div>
                                <p>{isRegistrationOpen ? t('admin.control.closeRegistration') : t('admin.control.openRegistration')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )
                    }
                    <IonButton slot="start" className={"secondary"} onClick={() => handleOpenNotificationModal()}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenNotificationModal();
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.notification.send')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" className={"secondary"} onClick={() => setShowOcrConfigModal(true)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setShowOcrConfigModal(true);
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.control.configureOcr')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    {(!isSchedule &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.TEAMS)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.TEAMS);
                                }
                            }}
                        >
                            <div>
                                <p>{t('admin.control.deleteTeams')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    {((isSchedule && !isFinalSchedule) &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.SCHEDULE)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.SCHEDULE);
                                }
                            }}
                        >
                            <div>
                                <p>{t('admin.control.deleteSchedule')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    {(isFinalSchedule &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.FINAL_SCHEDULE)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.FINAL_SCHEDULE);
                                }
                            }}
                        >
                            <div>
                                <p>{t('admin.control.deleteFinal')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.SURVEYS)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenModal(ChangeType.SURVEYS);
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.control.deleteSurveys')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.NOTIFICATIONS)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenModal(ChangeType.NOTIFICATIONS);
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.control.deleteSubscriptions')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.ALL)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenModal(ChangeType.ALL);
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.control.resetAll')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
                <TournamentModal
                    showModal={showModal}
                    closeModal={(deleteT) => {
                        setShowModal(false);
                        closeModal(deleteT);
                    }}
                    changeType={deleteType}
                />
                <BreakChangeModal
                    showModal={showBreakModal}
                    closeModal={(changeBreak) => {
                        setShowBreakModal(false);
                        closeBreakModal(changeBreak);
                    }}
                    aBreak={aBreak}
                />
                <NotificationModal
                    showModal={showNotificationModal}
                    closeModal={(notify) => {
                        setShowNotificationModal(false)
                        closeNotificationModal(notify);
                    }}
                    teams={teams}
                />
                <OcrConfigModal
                    showModal={showOcrConfigModal}
                    closeModal={(result) => {
                        setShowOcrConfigModal(false);
                        closeOcrConfigModal(result);
                    }}
                />
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </IonPage>
    );
};

export default Control;
