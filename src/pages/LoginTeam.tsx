import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import characters from "../util/api/config/characters";
import { errorToastColor } from "../util/api/config/constants";
import { TeamReturnDTO } from "../util/api/config/dto";
import { User } from '../util/api/config/interfaces';
import { getUser, setUser } from "../util/service/loginService";
import { getAllTeams, getTournamentOpen } from "../util/service/teamRegisterService";
import './RegisterTeam.css';


const LoginTeam: React.FC = () => {
    const history = useHistory();
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const handleLogin = () => {
        // TODO: refactor this
        const selectedTeam = teams?.find(team => team.teamName === teamName);
        if (selectedTeam) {
            const user: User = {
                name: selectedTeam.teamName,
                character: selectedTeam.character?.characterName || ''
            };
            setUser(user);
            history.push('/tab1');
        } else {
            setError("Ausgewähltes Team nicht in der Liste gefunden.");
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (getUser()) {
            history.push('/tab1');
        }
        const allTeams = getAllTeams();
        const tournamentOpen = getTournamentOpen();

        allTeams.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }, [location]);



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
                            <select value={teamName} onChange={(e) => setTeamName(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="">Select Team</option>
                                {teams && teams.map((team) => (
                                    <option key={team.teamName}
                                        value={team.teamName}
                                        style={{ backgroundImage: `url(/characters/${team.character?.characterName}.png)` }}
                                    >
                                        {team.teamName}
                                    </option>
                                ))}
                            </select>
                            {teamName && (
                                <div className="selected-character">
                                    {[teams.find(team => team.teamName === teamName)?.character?.characterName].map((character) => (
                                        character && characters.includes(character) &&
                                        <img
                                            src={`/characters/${character}.png`}
                                            alt={`${character} character`}
                                            key={character}
                                        />
                                    ))
                                    }
                                </div>
                            )
                            }
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
                                <p>Zum Team {teamName} anmelden</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    {/*<a onClick={() => history.push("/register")}*/}
                    {/*   style={{ cursor: "pointer", textDecoration: "underline" }}*/}
                    {/*   tabIndex={0}*/}
                    {/*   onKeyDown={(e) => {*/}
                    {/*       if (e.key === 'Enter' || e.key === ' ') {*/}
                    {/*           history.push('/register');*/}
                    {/*       }*/}
                    {/*   }}*/}
                    {/*>*/}
                    {/*    Team registrieren*/}
                    {/*</a>*/}
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
