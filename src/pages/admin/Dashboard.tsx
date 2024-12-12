import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast, IonAlert
} from "@ionic/react";
import {arrowForwardOutline} from 'ionicons/icons';
import {useHistory, useLocation} from "react-router";
import {useEffect, useState} from "react";

import {checkToken, getToken, getUser, removeToken} from "../../util/service/loginService";
import {checkFinalPlan, checkMatchPlan} from "../../util/api/MatchPlanApi";
import {checkFinal, checkMatch} from "../../util/service/adminService";
import {errorToastColor} from "../../util/api/config/constants";

const Dashboard: React.FC<LoginProps> = (props: LoginProps) => {

    const [isMatchPlan, setIsMatchPlan] = useState<boolean>(false);
    const [isFinalPlan, setIsFinalPlan] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const match = checkMatch();
        const final = checkFinal();

        match.then((result) => {
            setIsMatchPlan(result);
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

    const handleLogout = () => {
        removeToken();
        history.push('/admin/login');
    }

    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Admin
                        </LinearGradient>
                    </h2>
                    <h1>Dashboard</h1>
                    <div className={"adminDashboard"}>
                        { isMatchPlan ?
                            <IonButton slot="start" onClick={() => history.push('/admin/points')}>
                                <div>
                                    <p>Punkte eintragen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        { !isMatchPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/matchplan')}>
                                <div>
                                    <p>Spielplan erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        { !isFinalPlan && isMatchPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/final')}>
                                <div>
                                    <p>Finalspiele erzeugen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        : ''
                        }
                        { isFinalPlan ?
                            <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/results')}>
                                <div>
                                    <p>Endergebnis</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                            : ''
                        }
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/teams')}>
                            <div>
                                <p>Teams</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/survey')}>
                            <div>
                                <p>Umfragen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/control')}>
                            <div>
                                <p>Kontrollzentrum</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={handleLogout}>
                            <div>
                                <p>Logout</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default Dashboard;
