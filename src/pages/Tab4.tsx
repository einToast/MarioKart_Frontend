import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import { ShowTab2Props, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicScheduleService } from "../util/service";
import './Tab3.css';
import { useTranslation } from 'react-i18next';

const Tab4: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {
    const { t } = useTranslation();

    const location = useLocation();
    const [user] = useState<User | null>(PublicCookiesService.getUser());

    const updateShowTab2 = () => {
        Promise.all([
            PublicScheduleService.isScheduleCreated(),
            PublicScheduleService.isFinalScheduleCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([scheduleValue, finalScheduleValue, roundsLessTwoValue]) => {
            props.setShowTab2(!scheduleValue || finalScheduleValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const handleRefresh = async (event: CustomEvent) => {
        updateShowTab2();
        await new Promise(resolve => setTimeout(resolve, 500));
        event.detail.complete();
    };

    useEffect(() => {

        updateShowTab2();
    }, [location])

    return (
        <IonPage>
            {user?.teamId ? (
                <Header />
            ) : (
                <div >
                    <br />
                </div>
            )}
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        refreshingSpinner="crescent"
                    />
                </IonRefresher>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        {t('howToPlay.title')}
                    </LinearGradient>
                </h1>
                <br />
                <div className="video-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/3p25Jjj6UGA?si=c4boLd7F1PqX2A7c"
                        title={t('howToPlay.videoTitle')}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />

                </div>
                <h2>{t('howToPlay.rulesTitle')}</h2>
                <ul>
                    {t('howToPlay.rules', { returnObjects: true }).map(rule => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ul>
                <h2>{t('howToPlay.controls')}</h2>
                <h3>Pro Controller</h3>
                <div>
                    <img src={"/media/procon_how_to_play.webp"} alt={t('howToPlay.proControllerImage')} />
                </div>
                <h3>JoyCon</h3>
                <div>
                    <img src={"/media/joycon_how_to_play.webp"} alt={t('howToPlay.joyConImage')} />
                </div>
                <div style={{ marginBottom: "10px" }}></div>
            </IonContent>
        </IonPage>
    );
};

export default Tab4;
