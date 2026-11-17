import { IonButton, IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, } from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Toast from '../components/Toast';
import { TeamReturnDTO } from "../util/api/config/dto";
import { LoginProps, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicRegistrationService, PublicSettingsService } from "../util/service";
import './RegisterTeam.css';
import { useTranslation } from 'react-i18next';
import ImageSelect from '../components/ImageSelect';
import LanguageSwitch from '../components/LanguageSwitch';

const LoginTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [teamId, setTeamId] = useState<string>("-1");
    const [error, setError] = useState<string>('');
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
            navigate('/tab1');
        } else {
            setError(t('login.teamNotFound'));
            setIsError(true);
            setShowToast(true);
        }
    };

    const getAllTeams = () => {
        PublicRegistrationService.getTeamsSortedByTeamName()
            .then((response) => {
                setTeams(response);
            })
            .catch((error) => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            getAllTeams();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        if (PublicCookiesService.getUser()?.name) {
            navigate('/tab1');
        }
        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response && location.pathname === '/login') {
                navigate('/admin/login');
            }
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });

        getAllTeams();
    }, [location]);

    return (
        <IonPage>
            <IonContent fullscreen className="no-scroll">
                <div slot="fixed" className="languageSwitchCorner">
                    <LanguageSwitch />
                </div>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="crescent" />
                </IonRefresher>
                <div className="contentLogin">
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            {t('login.team')}
                        </LinearGradient>
                    </h2>
                    <h1>{t('login.title')}</h1>
                    <p>{t('login.description')}</p>
                    <div className="loginContainer">
                        <div className="borderContainer imageSelectField">
                            <ImageSelect
                                options={teams.map(team => ({
                                    value: String(team.id),
                                    label: team.teamName,
                                    character: team.character.characterName,
                                }))}
                                value={teamId}
                                placeholder={t('login.selectTeam')}
                                onChange={setTeamId}
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
                                <p>{t('login.submit', { team: teams.find(team => team.id === Number(teamId))?.teamName ?? '' })}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    {/*<a onClick={() => navigate("/register")}*/}
                    {/*   style={{ cursor: "pointer", textDecoration: "underline" }}*/}
                    {/*   tabIndex={0}*/}
                    {/*   onKeyDown={(e) => {*/}
                    {/*       if (e.key === 'Enter' || e.key === ' ') {*/}
                    {/*           navigate('/register');*/}
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
