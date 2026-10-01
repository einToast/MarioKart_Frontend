import { IonContent, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { PublicCookiesService, PublicScheduleService } from "../../util/service";
import { AdminRegistrationService } from "../../util/service/registration";
import "./Final.css";

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [scheduleCreated, setScheduleCreated] = useState<boolean>(false);
    const [finalScheduleCreated, setFinalScheduleCreated] = useState<boolean>(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

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
        const loadData = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            getFinalTeams();
            const [schedule, finalSchedule] = await Promise.all([
                PublicScheduleService.isScheduleCreated(),
                PublicScheduleService.isFinalScheduleCreated()
            ]);
            setScheduleCreated(schedule);
            setFinalScheduleCreated(finalSchedule);
        };

        loadData().catch(error => {
            setError(error.message);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>Teams</LinearGradient>
                </h2>
                <h3>
                    Anzahl der angemeldeten Teams: {teams.length}
                </h3>

                <TeamAdminContainer
                    teams={teams}
                    scheduleCreated={scheduleCreated}
                    finalScheduleCreated={finalScheduleCreated}
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
