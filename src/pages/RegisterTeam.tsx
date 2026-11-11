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
import { useNavigate, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { LinearGradient } from "react-text-gradients";
import Toast from "../components/Toast";
import characters from "../util/api/config/characters";
import { LoginProps, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicRegistrationService, PublicSettingsService } from "../util/service";
import './RegisterTeam.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../components/LanguageSwitch';

const RegisterTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const { t } = useTranslation();
    const [teamName, setTeamName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const navigate = useNavigate();
    const [updatedCharacterNames, setUpdatedCharacterNames] = useState<string[] | null>(null);
    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                    navigate('/tab1');
                } else {
                    setError(t('register.failed'));
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
        getCharacterNames();
        Promise.all([
            PublicSettingsService.getRegistrationOpen(),
            PublicSettingsService.getTournamentOpen()
        ])
            .then(([registrationOpen, tournamentOpen]) => {
                if (location.pathname !== '/register') {
                    return;
                }
                if (!registrationOpen) {
                    navigate('/login');
                }
                if (!tournamentOpen) {
                    navigate('/admin/login');
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }, [location]);

    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <div slot="fixed" className="languageSwitchCorner">
                    <LanguageSwitch />
                </div>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="circles" />
                </IonRefresher>
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            {t('login.team')}
                        </LinearGradient>
                    </h2>
                    <h1>{t('register.title')}</h1>
                    <p>{t('register.description')}</p>

                    <div className={"loginContainer"}>
                        <div className={"borderContainer selectCharacter"}>
                            <select value={selectedCharacter} onChange={(e) => setSelectedCharacter(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="" disabled hidden={true}>
                                    {t('register.chooseCharacter')}
                                </option>
                                {updatedCharacterNames?.map((character) => (
                                    <option
                                        key={character}
                                        value={character}
                                        style={{ backgroundImage: `url(/characters/${character}.webp)` }} // Verwende url() anstelle von backgroundImage
                                    >
                                        {character}
                                    </option>
                                ))}
                            </select>
                            {selectedCharacter && (
                                <div className="selected-character">
                                    {characters.includes(selectedCharacter) && (
                                        <img
                                            src={`/characters/${selectedCharacter}.webp`}
                                            alt={t('characterImage', { name: selectedCharacter })}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={"borderContainer"}>
                            <input
                                type="text"
                                placeholder={t('register.teamName')}
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
                                <p>{t('register.submit')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <Link to="/login" style={{ textDecoration: "underline" }}>
                        {t('register.joinTeam')}
                    </Link>
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
