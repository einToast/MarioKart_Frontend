import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage
} from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminScheduleService, PublicRegistrationService, PublicUserService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";

const MatchPlan: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);

    const [error, setError] = useState<string>('Error');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }

        const teamNames = PublicRegistrationService.getTeams();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    const handleMatchPlanCreation = () => {
        setButtonDisabled(true);
        AdminScheduleService.createMatchPlan()
            .then(newRounds => {
                if (newRounds) {
                    setError('Spielplan erfolgreich erstellt');
                    setIsError(false);
                    setShowToast(true);
                    history.push('/admin/dashboard');
                } else {
                    setError('Spielplan konnte nicht erstellt werden');
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
    };

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
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Spielplan erstellen
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"} style={{ paddingBottom: "50px" }}>
                    {teams ? (
                        <TeamAdminContainer
                            teams={teams}
                            matchPlanCreated={false}
                            finalPlanCreated={false}
                            setModalClosed={setModalClosed}
                            modalClosed={modalClosed}
                            getTeams={PublicRegistrationService.getTeams}
                        />

                    ) : (
                        <p>loading...</p>
                    )}
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled}>
                        <div onClick={handleMatchPlanCreation}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleMatchPlanCreation();
                                }
                            }}
                        >
                            <p>Spielplan erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </IonPage>
    )
        ;
};

export default MatchPlan;
