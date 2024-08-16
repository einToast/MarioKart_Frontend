import { useEffect, useState } from 'react';
import axios from "axios";
import '../interface/interfaces';
import './RegisterTeam.css';
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
import {TeamReturnDTO} from "../util/api/config/dto";
import {getAllTeams} from "../util/service/teamRegisterService";
import characters from "../interface/characters";

interface LoginProps {
    setUser: (user: User) => void;
}

const LoginTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const history = useHistory();
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>('#CD7070');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        setLoading(true);
        const allTeams = getAllTeams();

        allTeams.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const handleLogin = () => {
        const selectedTeam = teams?.find(team => team.teamName === teamName);
        if (selectedTeam) {
            const user: User = {
                loggedIn: true,
                name: selectedTeam.teamName,
                character: selectedTeam.character.characterName
            };
            localStorage.setItem("user", JSON.stringify(user));
            props.setUser(user);
            history.push('/tab1');
        } else {
            setError("Ausgewähltes Team nicht in der Liste gefunden.");
            setToastColor('#CD7070');
            setShowToast(true);
        }
    };

    let character;
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
                    <p>Melde dich zu deinem bereits bestehenden (registrierten) Team an. Wenn es bislang nicht in der
                        Liste auftaucht, lade neu oder registriere dein Team.</p>
                    <div className="loginContainer">
                        <div className="borderContainer selectCharacter">
                            <select value={teamName} onChange={(e) => setTeamName(e.target.value)} style={{cursor: "pointer"}}>
                                <option value="">Select Team</option>
                                {teams && teams.map((team) => (
                                    <option key={team.teamName}
                                            value={team.teamName}
                                            style={{backgroundImage: `url(../resources/media/${team.character.characterName}.png)`}}
                                    >
                                        {team.teamName}
                                    </option>
                                ))}
                            </select>
                            {teamName && (
                                <div className="selected-character">
                                    {[teams.find(team => team.teamName === teamName).character.characterName].map((character) => (
                                        characters.includes(character) &&
                                        <img
                                            src={`../resources/media/${character}.png`}
                                            alt={`${character} character`}
                                        />
                                    ))
                                    }
                                </div>
                            )
                            }
                        </div>
                        <IonButton onClick={handleLogin} slot="start">
                            <div>
                                <p>Zum Team {teamName} anmelden</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a onClick={() => history.push("/register")}
                       style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                        Team registrieren
                    </a>
                </div>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={error}
                    duration={3000}
                    cssClass="toast"
                    style={{
                        '--toast-background': toastColor
                    }}
                />
            </IonContent>
        </IonPage>
    );
};

export default LoginTeam;
