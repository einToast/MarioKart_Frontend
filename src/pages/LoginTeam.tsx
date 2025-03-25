import { IonButton, IonContent, IonIcon, IonPage, } from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Toast from '../components/Toast';
import { TeamReturnDTO } from "../util/api/config/dto";
import { LoginProps, User } from '../util/api/config/interfaces';
import { PublicCookiesService } from "../util/service";
import { PublicRegistrationService } from "../util/service/registration";
import { PublicSettingsService } from "../util/service/settings";
import './RegisterTeam.css';

const LoginTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const history = useHistory();
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [teamId, setTeamId] = useState<string>("-1");
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);
    const [isError, setIsError] = useState<boolean>(true);

    const location = useLocation();

    const handleLogin = () => {
        const selectedTeam = teams.find(team => team.id === Number(teamId));
        if (selectedTeam) {
            const user: User = {
                character: selectedTeam.character.characterName,
                teamId: selectedTeam.id,
                name: selectedTeam.teamName,
            };
            PublicCookiesService.setUser(user);
            props.setUser(user);
            history.push('/tab1');
        } else {
            setError("Ausgewähltes Team nicht in der Liste gefunden.");
            setIsError(true);
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (PublicCookiesService.getUser()?.name) {
            history.push('/tab1');
        }
        const allTeams = PublicRegistrationService.getTeams();
        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        allTeams.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
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
                            <select value={teamId} onChange={(e) => setTeamId(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value={-1} hidden>Select Team</option>
                                {teams && teams.map((team) => (
                                    <option key={team.id}
                                        value={team.id}
                                        style={{ backgroundImage: `url(/characters/${team.character.characterName}.png)` }}
                                    >
                                        {team.teamName}
                                    </option>
                                ))}
                            </select>
                            {teamId && teamId !== "-1" && (
                                <div className="selected-character">
                                    {[teams.find(team => team.id === Number(teamId))?.character.characterName].map((character) => (
                                        <img
                                            src={`/characters/${character}.png`}
                                            alt={`${character} character`}
                                            key={character}
                                        />
                                    ))}
                                </div>
                            )}
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
                                <p>Zum Team {teams.find(team => team.id === Number(teamId))?.teamName} anmelden</p>
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
                <Toast
                    message={error}
                    showToast={showToast}
                    setShowToast={setShowToast}
                    isError={isError}
                />
            </IonContent>
        </IonPage>
    );
};

export default LoginTeam;
