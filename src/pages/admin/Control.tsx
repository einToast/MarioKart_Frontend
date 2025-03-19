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
import '../RegisterTeam.css';

import BreakChangeModal from "../../components/modals/BreakChangeModal";
import TournamentModal from "../../components/modals/TournamentModal";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { BreakReturnDTO } from "../../util/api/config/dto";
import { BreakModalResult } from "../../util/api/config/interfaces";
import { PublicScheduleService, PublicSettingsService, PublicUserService } from "../../util/service";
import { ChangeType } from "../../util/service/util";


const Control: React.FC = () => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
    const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
    const [aBreak, setBreak] = useState<BreakReturnDTO>({ id: 0, startTime: '', endTime: '', breakEnded: false, round: { id: 0, roundNumber: 0, startTime: '', endTime: '', finalGame: false, played: false } });
    const [deleteType, setDeleteType] = useState<ChangeType>(ChangeType.MATCH_PLAN);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showBreakModal, setShowBreakModal] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    const handleOpenModal = (deleteType: ChangeType) => {
        setDeleteType(deleteType);
        setShowModal(true);
    }

    const handleOpenBreakModal = () => {
        const breakData = PublicScheduleService.getBreak();
        breakData.then((result) => {
            setBreak(result);
            setShowBreakModal(true);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    const closeModal = (changeT: ChangeType) => {
        setModalClosed(prev => !prev);
        if (typeof changeT !== 'string') {
            return;
        }

        setToastColor(successToastColor);
        switch (changeT) {
            case ChangeType.TOURNAMENT:
                // TODO: better way to handle this
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
                setToastColor(errorToastColor);
                break;
        }
        setShowToast(true);
    };

    const closeBreakModal = (changeBreak: BreakModalResult) => {
        setModalClosed(prev => !prev);

        if (changeBreak.breakChanged) {
            setToastColor(successToastColor);
            setError('Die Pause wurde geändert');
            setShowToast(true);
        }
    }

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }

        const match = PublicScheduleService.isMatchPlanCreated();
        const final = PublicScheduleService.isFinalPlanCreated();
        const registration = PublicSettingsService.getRegistrationOpen();
        const tournament = PublicSettingsService.getTournamentOpen();

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

        registration.then((result) => {
            setIsRegistrationOpen(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        tournament.then((result) => {
            setIsTournamentOpen(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
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
