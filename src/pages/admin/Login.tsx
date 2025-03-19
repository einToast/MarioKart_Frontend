import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router";
import { LinearGradient } from "react-text-gradients";
import { errorToastColor } from "../../util/api/config/constants";
import { PublicUserService } from "../../util/service";
import '../RegisterTeam.css';

const Login: React.FC = () => {
    const user = PublicUserService.getUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();


    const handleLogin = async () => {
        try {
            await PublicUserService.login(username, password);
            setUsername('');
            setPassword('');
            history.push('/admin/dashboard');
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (PublicUserService.checkToken()) {
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
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleLogin();
                                    }
                                }}
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
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleLogin();
                                    }
                                }}
                                required
                            />
                        </div>
                        <IonButton onClick={handleLogin} slot="start"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleLogin();
                                }
                            }}
                        >
                            <div>
                                <p>Admin Bereich betreten</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a onClick={() => history.push("/login")}
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                history.push('/login');
                            }
                        }}
                    >
                        Zurück zum Team Login
                    </a>
                </div>
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

            </IonContent>
        </IonPage>
    );
};

export default Login;
