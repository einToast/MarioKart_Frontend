import { IonButton, IonContent, IonIcon, IonPage, } from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from '../../components/Toast';
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, AdminScheduleService } from "../../util/service";
import { PublicCookiesService } from "../../util/service";
import "./Final.css";

const Final: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const history = useHistory();
    const location = useLocation();

    const handleTeamsReset = () => {
        AdminRegistrationService.resetEveryTeamFinalParticipation()
            .then(teams => {
                if (teams) {
                    setError('Teams zurückgesetzt');
                    setIsError(false);
                    setShowToast(true);
                    return getFinalTeams();
                } else {
                    setError('Teams konnten nicht zurückgesetzt werden');
                    setIsError(true);
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    }

    const getFinalTeams = () => {
        const teamNames = AdminRegistrationService.getFinalTeams();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }

    const handleFinalCreation = () => {
        setButtonDisabled(true);
        AdminScheduleService.createFinalPlan()
            .then(final => {
                if (final) {
                    setError('Finale erfolgreich erstellt');
                    setIsError(false);
                    setShowToast(true);
                    history.push('/admin/dashboard');
                } else {
                    setError('Finale konnte nicht erstellt werden');
                    setIsError(true);
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            })
            .finally(() => {
                setButtonDisabled(false);
            });
    }

    useEffect(() => {
        if (!PublicCookiesService.checkToken()) {
            window.location.assign('/admin/login');
        }
        getFinalTeams();
    }, [modalClosed, location]);

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
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>ACHTUNG!</LinearGradient>
                </h2>
                <p>Bist du dir sicher, dass du das Finalspiel erzeugen willst? Du hast danach nicht mehr die Möglichkeit
                    Rundenpunkte einzutragen.</p>
                <p className={"bold"}>Folgende Teams sind im Finale:</p>

                <div className={"teamFinalContainer"}>
                    {teams ? (
                        <TeamAdminContainer
                            teams={teams}
                            matchPlanCreated={true}
                            finalPlanCreated={false}
                            setModalClosed={setModalClosed}
                            modalClosed={modalClosed}
                            getTeams={getFinalTeams}
                        />
                    ) : (
                        <p>loading...</p>
                    )
                    }
                </div>
                <div style={{ marginBottom: '115px' }}></div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round secondary"}>
                        <div onClick={handleTeamsReset}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleTeamsReset();
                                }
                            }}
                        >
                            <p>Teams zurücksetzen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={handleTeamsReset}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleTeamsReset();
                                    }
                                }}
                            ></IonIcon>
                        </div>
                    </IonButton>
                    {/* TODO: fix, does not work properly, idk */}
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled}>
                        <div onClick={handleFinalCreation}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleFinalCreation();
                                }
                            }}
                        >
                            <p>Finale erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={handleFinalCreation}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleFinalCreation();
                                    }
                                }}
                            ></IonIcon>
                        </div>
                    </IonButton>
                </div>
                <Toast
                    message={error}
                    showToast={showToast}
                    setShowToast={setShowToast}
                    isError={isError}
                />
            </IonContent>
        </IonPage>
    );
};

export default Final;