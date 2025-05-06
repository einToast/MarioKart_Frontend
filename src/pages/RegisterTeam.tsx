import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonRefresher,
    IonRefresherContent
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Toast from "../components/Toast";
import characters from "../util/api/config/characters";
import { LoginProps, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicRegistrationService, PublicSettingsService } from "../util/service";
import './RegisterTeam.css';

const RegisterTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const [teamName, setTeamName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const history = useHistory();
    const [updatedCharacterNames, setUpdatedCharacterNames] = useState<string[] | null>(null);
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const handleEnterPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogin = () => {
        PublicRegistrationService.registerTeam(teamName, selectedCharacter)
            .then(team => {
                if (team) {
                    const user: User = {
                        name: team.teamName,
                        character: team.character.characterName || '',
                        teamId: team.id
                    };
                    PublicCookiesService.setUser(user);
                    props.setUser(user);
                    history.push('/tab1');
                } else {
                    setError('Team konnte nicht registriert werden');
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
                getCharacterNames();
            });
    };

    const getCharacterNames = () => {
        const allCharacters = PublicRegistrationService.getAvailableCharacters()

        allCharacters.then((response) => {
            setUpdatedCharacterNames(response.map(character => character.characterName));
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });
    };

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            getCharacterNames();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        Promise.all([
            PublicSettingsService.getRegistrationOpen(),
            PublicSettingsService.getTournamentOpen(),
            getCharacterNames()
        ])
            .then(([registrationOpen, tournamentOpen, _]) => {
                if (!registrationOpen) {
                    history.push('/login');
                }
                if (!tournamentOpen) {
                    history.push('/admin/login');
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }, [location]);

    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="circles" />
                </IonRefresher>
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Team
                        </LinearGradient>
                    </h2>
                    <h1>Register</h1>
                    <p>Registriere Dich und dein Team um gemeinsam am Turnier teilzunehmen.</p>

                    <div className={"loginContainer"}>
                        <div className={"borderContainer selectCharacter"}>
                            <select value={selectedCharacter} onChange={(e) => setSelectedCharacter(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="" disabled hidden={true}>
                                    Wähle deinen Charakter
                                </option>
                                {updatedCharacterNames && updatedCharacterNames.map((character) => (
                                    <option
                                        key={character}
                                        value={character}
                                        style={{ backgroundImage: `url(/characters/${character}.png)` }} // Verwende url() anstelle von backgroundImage
                                    >
                                        {character}
                                    </option>
                                ))}
                            </select>
                            {selectedCharacter && (
                                <div className="selected-character">
                                    {characters.includes(selectedCharacter) && (
                                        <img
                                            src={`/characters/${selectedCharacter}.png`}
                                            alt={`${selectedCharacter} character`}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={"borderContainer"}>
                            <input
                                type="text"
                                placeholder="Teamname"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                onKeyPress={handleEnterPress}
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
                                <p>Team registrieren</p>
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
                        registriertem Team beitreten
                    </a>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonPage>
    )
        ;
};

export default RegisterTeam;
