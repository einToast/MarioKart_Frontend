import { IonButton, IonContent, IonIcon, IonPage, } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { LinearGradient } from "react-text-gradients";
import Toast from '../../components/Toast';
import { PublicCookiesService, PublicUserService } from "../../util/service";
import '../RegisterTeam.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        PublicUserService.login(username, password)
            .then(() => {
                setUsername('');
                setPassword('');
                navigate('/admin/dashboard');
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    useEffect(() => {
        if (location.pathname !== '/admin/login') {
            return;
        }
        const fetchData = async () => {
            if (await PublicCookiesService.checkToken()) {
                navigate('/admin/dashboard');
            }
        }
        fetchData().catch(error => {
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
                <div className="contentLogin">
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            {t('admin.title')}
                        </LinearGradient>
                    </h2>
                    <h1>{t('admin.login.title')}</h1>
                    <p>{t('admin.login.description')}</p>
                    <p>{t('admin.login.joke')}</p>

                    <div className="loginContainer">
                        <div className="borderContainer">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder={t('admin.login.username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
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
                                placeholder={t('admin.login.password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
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
                                <p>{t('admin.login.submit')}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <Link to="/login" style={{ textDecoration: "underline" }}>
                        {t('admin.backToTeamLogin')}
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
    );
};

export default Login;
