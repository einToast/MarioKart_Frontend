import { useState } from 'react';
import { useHistory } from "react-router";
import axios from "axios";
import '../interface/interfaces';
import './Login.css';
import { LinearGradient } from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';

interface LoginProps {
    setUserAdmin: (userAdmin: AdminUser) => void;
}

const AdminLoginFsr: React.FC<LoginProps> = (props: LoginProps) => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/admin/login', {
                auth: {
                    username,
                    password
                }
            });
            history.push('/admin-dashboard');
        } catch (error) {
            setError('Invalid username or password');
            setShowToast(true);
        }
    };

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
                />
            </IonContent>
        </IonPage>
    );
};

export default AdminLoginFsr;
