import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import FinalGraph from "../../components/graph/FinalGraph";
import GroupGraph from "../../components/graph/GroupGraph";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, PublicCookiesService, PublicScheduleService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";

const Results: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [isFinalSchedule, setIsFinalSchedule] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const loadResults = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            Promise.all([
                AdminRegistrationService.getFinalTeams(),
                PublicScheduleService.isFinalScheduleCreated()
            ])
                .then(([teams, finalSchedule]) => {
                    setTeams(teams);
                    setIsFinalSchedule(finalSchedule);
                })
                .catch(error => {
                    setError(error.message);
                    setShowToast(true);
                });
        };

        loadResults();
    }, [location]);

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
                        {isFinalSchedule ? 'Endergebnis' : 'Zwischenergebnis'}
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"}>
                    {isFinalSchedule ? (
                        <FinalGraph teams={teams} />
                    ) : (
                        <GroupGraph teams={teams} />
                    )}
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

export default Results;
