import {
    IonContent,
    IonIcon,
    IonPage
} from "@ionic/react";
import {
    arrowBackOutline
} from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { PublicScheduleService } from "../../util/service";
import { AdminRegistrationService } from "../../util/service/registration";
import { PublicUserService } from "../../util/service/user";
import "./Final.css";

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [matchplanCreated, setMatchplanCreated] = useState<boolean>(false);
    const [finalplanCreated, setFinalplanCreated] = useState<boolean>(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    const getFinalTeams = () => {
        const teamNames = AdminRegistrationService.getTeamsSortedByFinalPoints();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });
    }

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }


        Promise.all([
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            getFinalTeams()
        ])
            .then(([matchPlan, finalPlan, _]) => {
                setMatchplanCreated(matchPlan);
                setFinalplanCreated(finalPlan);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });

    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>Teams</LinearGradient>
                </h2>

                <TeamAdminContainer
                    teams={teams}
                    matchPlanCreated={matchplanCreated}
                    finalPlanCreated={finalplanCreated}
                    setModalClosed={setModalClosed}
                    modalClosed={modalClosed}
                    getTeams={getFinalTeams}
                />
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

export default Teams;