import {useEffect, useState} from 'react';
import { useHistory } from "react-router";
import axios from "axios";
import '../../interface/interfaces';
import '../RegisterTeam.css';
import { LinearGradient } from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import {checkToken, getUser, loginUser} from "../../util/service/loginService";

interface LoginProps {
    setUserAdmin: (userAdmin: AdminUser) => void;
}

const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const user = getUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>('#CD7070');
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();

    const handleLogin = async () => {
        try {
            await loginUser(username, password);
            setUsername('');
            setPassword('');
            history.push('/admin/dashboard');
        } catch (error) {
            setError(error.message);
            setToastColor('#CD7070');
            setShowToast(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (checkToken()) {
                history.push('/admin/dashboard');
            }
        }
        fetchData();
    }, []);

    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <div className="contentLogin">
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Admin
                        </LinearGradient>
                    </h2>
                    <h1>Bereich</h1>
                    <p>Hier haben nur die Organisatoren Zutritt. Also versuche es gar nicht erst.</p>
                    <p>(Das Password ist 12345678)</p>

                    <div className="loginContainer">
                        <div className="borderContainer">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Benutzername"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="borderContainer">
                            <input
                                type="password"
                                id="pass"
                                name="password"
                                placeholder="Passwort"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <IonButton onClick={handleLogin} slot="start">
                            <div>
                                <p>Admin Bereich betreten</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                </div>
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

            </IonContent>
        </IonPage>
    );
};

export default Login;
