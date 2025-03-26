import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import FinalGraph from "../../components/graph/FinalGraph";
import GroupGraph from "../../components/graph/GroupGraph";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, PublicScheduleService } from "../../util/service";
import { PublicCookiesService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";

const Results: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!PublicCookiesService.checkToken()) {
            window.location.assign('/admin/login');
        }

        Promise.all([
            AdminRegistrationService.getFinalTeams(),
            PublicScheduleService.isFinalPlanCreated()
        ])
            .then(([teams, finalPlan]) => {
                setTeams(teams);
                setIsFinalPlan(finalPlan);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });

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
                        {isFinalPlan ? 'Endergebnis' : 'Zwischenergebnis'}
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"}>
                    {isFinalPlan ? (
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
