import {
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import {
    arrowBackOutline
} from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import { errorToastColor } from "../../util/api/config/constants";
import { TeamReturnDTO } from "../../util/api/config/dto";
import {
    checkMatch,
    getTeamFinalRanked
} from "../../util/service/adminService";
import { checkToken, getUser } from "../../util/service/loginService";
import "./Final.css";

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [matchplanCreated, setMatchplanCreated] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    const getFinalTeams = async () => {
        const teamNames = getTeamFinalRanked();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        const matchplan = checkMatch();

        getFinalTeams();

        matchplan.then((response) => {
            setMatchplanCreated(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
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
                    matchplanCreated={matchplanCreated}
                    setModalClosed={setModalClosed}
                    modalClosed={modalClosed}
                    getTeams={getFinalTeams}
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

export default Teams;