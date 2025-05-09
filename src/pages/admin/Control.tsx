import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import '../RegisterTeam.css';

import BreakChangeModal from "../../components/modals/BreakChangeModal";
import NotificationModal from "../../components/modals/NotificationModal";
import TournamentModal from "../../components/modals/TournamentModal";
import Toast from "../../components/Toast";
import { BreakReturnDTO, TeamReturnDTO } from "../../util/api/config/dto";
import { BreakModalResult, NotificationModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService, AdminScheduleService, PublicCookiesService, PublicScheduleService, PublicSettingsService } from "../../util/service";
import { ChangeType } from "../../util/service/util";

const Control: React.FC = () => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
    const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
    const [aBreak, setABreak] = useState<BreakReturnDTO>({ id: 0, startTime: '', endTime: '', breakEnded: false, round: undefined });
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [deleteType, setDeleteType] = useState<ChangeType>(ChangeType.MATCH_PLAN);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showBreakModal, setShowBreakModal] = useState<boolean>(false);
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
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
            setTeams(result.sort((a, b) => a.teamName.localeCompare(b.teamName)));
            setShowNotificationModal(true);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });


    }


    const closeModal = (changeT: ChangeType) => {
        setModalClosed(prev => !prev);
        if (typeof changeT !== 'string') {
            return;
        }

        setIsError(false);
        switch (changeT) {
            case ChangeType.TOURNAMENT:
                setError('Das Turnier wurde ' + (isTournamentOpen ? 'geschlossen' : 'geöffnet'));
                break;
            case ChangeType.REGISTRATION:
                setError('Die Registrierung wurde ' + (isRegistrationOpen ? 'geschlossen' : 'geöffnet'));
                break;
            case ChangeType.SURVEYS:
                setError('Alle Umfragen wurden gelöscht');
                break;
            case ChangeType.TEAMS:
                setError('Alle Teams wurden gelöscht');
                break;
            case ChangeType.MATCH_PLAN:
                setError('Der Spielplan wurde gelöscht');
                break;
            case ChangeType.FINAL_PLAN:
                setError('Alle Finalspiele wurden gelöscht');
                break;
            case ChangeType.ALL:
                setError('Die Anwendung wurde zurückgesetzt');
                break;
            default:
                setError('Error');
                setIsError(true);
                break;
        }
        setShowToast(true);
    };

    const closeBreakModal = (changeBreak: BreakModalResult) => {
        setModalClosed(prev => !prev);

        if (changeBreak.breakChanged) {
            setError('Die Pause wurde geändert');
            setIsError(false);
            setShowToast(true);
        }
    }

    const closeNotificationModal = (notify: NotificationModalResult) => {
        setModalClosed(prev => !prev);
        if (notify.notificationSent) {
            setError('Benachrichtigung wurde gesendet');
            setIsError(false);
            setShowToast(true);
        }
    }

    useEffect(() => {
        if (!PublicCookiesService.checkToken()) {
            window.location.assign('/admin/login');
        }

        Promise.all([
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicSettingsService.getRegistrationOpen(),
            PublicSettingsService.getTournamentOpen(),
        ])
            .then(([matchPlan, finalPlan, registrationOpen, tournamentOpen]) => {
                setIsMatchPlan(matchPlan);
                setIsFinalPlan(finalPlan);
                setIsRegistrationOpen(registrationOpen);
                setIsTournamentOpen(tournamentOpen);
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });

    }, [modalClosed, location]);

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
                    {(isMatchPlan &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenBreakModal()}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenBreakModal();
                                }
                            }}
                        >
                            <div>
                                <p>Pause ändern</p>
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
                            <p>{isTournamentOpen ? 'Turnier schließen' : 'Turnier öffnen'}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>

                    {(!isMatchPlan &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.REGISTRATION)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.REGISTRATION);
                                }
                            }}
                        >
                            <div>
                                <p>{isRegistrationOpen ? 'Registrierung schließen' : 'Registrierung öffnen'}</p>
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
                            <p>Benachrichtigung senden</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    {(!isMatchPlan &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.TEAMS)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.TEAMS);
                                }
                            }}
                        >
                            <div>
                                <p>Alle Teams löschen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    {((isMatchPlan && !isFinalPlan) &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.MATCH_PLAN)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.MATCH_PLAN);
                                }
                            }}
                        >
                            <div>
                                <p>Gesamten Spielplan löschen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    )}
                    {(isFinalPlan &&
                        <IonButton slot="start" className={"secondary"} onClick={() => handleOpenModal(ChangeType.FINAL_PLAN)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleOpenModal(ChangeType.FINAL_PLAN);
                                }
                            }}
                        >
                            <div>
                                <p>Alle Finalspiele löschen</p>
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
                            <p>Alle Umfragen löschen</p>
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
                            <p>Anwendung zurücksetzen</p>
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
