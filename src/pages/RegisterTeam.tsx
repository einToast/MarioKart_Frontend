import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage
} from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Toast from "../components/Toast";
import characters from "../util/api/config/characters";
import { LoginProps, User } from '../util/api/config/interfaces';
import { PublicRegistrationService, PublicSettingsService, PublicUserService } from "../util/service";
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

    const getCharacterNames = () => {
        const allCharacters = PublicRegistrationService.getAvailableCharacters()

        allCharacters.then((response) => {
            setUpdatedCharacterNames(response.map(character => character.characterName));
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });
    };

    useEffect(() => {
        const registrationOpen = PublicSettingsService.getRegistrationOpen();
        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        registrationOpen.then((response) => {
            if (!response) {
                history.push('/login');
            }
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
            setShowToast(true);
        });
        getCharacterNames();
    }, [location]);


    const handleLogin = async () => {
        try {
            const team = await PublicRegistrationService.registerTeam(teamName, selectedCharacter);

            if (team) {
                const user: User = {
                    name: team.teamName,
                    character: team.character.characterName || '',
                    teamId: team.id
                };
                PublicUserService.setUser(user);
                props.setUser(user);
                history.push('/tab1');
            } else {
                throw new Error("Team konnte nicht erstellt werden");
            }
        } catch (error) {
            setError(error.message);
            setShowToast(true);
            getCharacterNames();
        }
    }


    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
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
