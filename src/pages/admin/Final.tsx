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
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, AdminScheduleService, PublicRegistrationService, PublicUserService } from "../../util/service";
import "./Final.css";

const Final: React.FC = () => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);
    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    const handleTeamsReset = async () => {
        try {
            const teams = await AdminRegistrationService.resetAllTeamFinalParticipation();
            if (teams) {
                setError('Teams zurückgesetzt');
                setToastColor(successToastColor);
                setShowToast(true);
                await getFinalTeams();
            } else {
                throw new TypeError('Teams konnten nicht zurückgesetzt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const getFinalTeams = async () => {
        const teamNames = PublicRegistrationService.getTeamTop4FinalRanked();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    const handleFinalCreation = async () => {
        try {
            setButtonDisabled(true);
            const final = await AdminScheduleService.createFinalPlan();
            if (final) {
                setError('Finale erfolgreich erstellt');
                setToastColor(successToastColor);
                setShowToast(true);
                history.push('/admin/dashboard');
            } else {
                throw new TypeError('Finale konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        } finally {
            setButtonDisabled(false);
        }
    }

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
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
                            matchplanCreated={true}
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
                    {/* TODO: fix, does not work properly */}
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

export default Final;