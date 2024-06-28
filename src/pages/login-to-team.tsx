import { useEffect, useState } from 'react';
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
import { arrowForwardOutline } from "ionicons/icons";
import { useHistory } from "react-router";

interface LoginProps {
    setUser: (user: User) => void;
}

const LoginTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const history = useHistory();
    const [teams, setTeams] = useState<Team[] | null>(null);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const getTeamName = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3000/api/team/all');
            const responseData = response.data as Team[];
            setTeams(responseData);
        } catch (error) {
            console.error(error);
            setError('Fehler beim Laden der Teams');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeamName();
    }, []);

    const handleLogin = () => {
        const selectedTeam = teams?.find(team => team.name === teamName);
        if (selectedTeam) {
            const user: User = {
                loggedIn: true,
                name: selectedTeam.name,
                character: selectedTeam.character
            };
            localStorage.setItem("user", JSON.stringify(user));
            props.setUser(user);
            history.push('/tab1');
        } else {
            setError("Ausgewähltes Team nicht in der Liste gefunden.");
            setShowToast(true);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <div className="contentLogin">
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Team
                        </LinearGradient>
                    </h2>
                    <h1>Login</h1>
                    <p>Melde dich zu deinem bereits bestehenden (registrierten) Team an. Wenn es bislang nicht in der Liste auftaucht, lade neu oder registriere dein Team.</p>
                    <div className="loginContainer">
                        <div className="borderContainer">
                            <select value={teamName} onChange={(e) => setTeamName(e.target.value)}>
                                <option value="">Select Team</option>
                                {teams && teams.map((team) => (
                                    <option key={team.name} value={team.name}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                        <IonButton onClick={handleLogin} slot="start">
                            <div>
                                <p>Zum Team {teamName} anmelden</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a href="/">Team registrieren</a>
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

export default LoginTeam;
