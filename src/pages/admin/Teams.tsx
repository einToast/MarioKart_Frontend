import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
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
        const loadData = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            try {
                const [schedule, finalSchedule, _] = await Promise.all([
                    PublicScheduleService.isScheduleCreated(),
                    PublicScheduleService.isFinalScheduleCreated(),
                    getFinalTeams()
                ]);
                setScheduleCreated(schedule);
                setFinalScheduleCreated(finalSchedule);
            } catch (error: any) {
                setError(error.message);
                setShowToast(true);
            }
        };

        loadData();
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
