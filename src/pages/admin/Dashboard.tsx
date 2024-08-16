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
import {useHistory} from "react-router";
import {useEffect, useState} from "react";

import {checkToken, getToken, getUser, removeToken} from "../../util/service/loginService";

const Dashboard: React.FC<LoginProps> = (props: LoginProps) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>('#CD7070');
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        const token = getToken();


        if (!token) {
            history.push('/admin/login');
        }
    }, []);

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
                        <IonButton slot="start" onClick={() => history.push('/admin/points')}>
                            <div>
                                <p>Punkte eintragen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/matchplan')}>
                            <div>
                                <p>Spielplan erzeugen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/final')}>
                            <div>
                                <p>Finalspiele erzeugen</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/results')}>
                            <div>
                                <p>Endergebnis</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        <IonButton slot="start" className={"secondary"} onClick={() => history.push('/admin/survey')}>
                            <div>
                                <p>Umfragen</p>
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
