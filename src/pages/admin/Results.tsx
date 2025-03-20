import {
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import FinalGraph from "../../components/graph/FinalGraph";
import GroupGraph from "../../components/graph/GroupGraph";
import { errorToastColor } from "../../util/api/config/constants";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, PublicScheduleService, PublicUserService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";


const Results: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }
        // TODO: update???
        const teamNames = AdminRegistrationService.getFinalTeams();
        const final = PublicScheduleService.isFinalPlanCreated();
        teamNames.then((response) => {
            setTeams(response);
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
    )
        ;
};

export default Results;
