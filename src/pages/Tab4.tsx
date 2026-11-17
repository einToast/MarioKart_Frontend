import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import { HowToPlay, ShowTab2Props, User } from '../util/api/config/interfaces';
import { DEFAULT_VIDEO_URL, parseHowToPlay, youtubeEmbedUrl } from '../util/layout/howToPlay';
import { PublicCookiesService, PublicScheduleService, PublicSettingsService } from "../util/service";
import { useLocalize } from '../hooks/useLocalize';
import './Tab3.css';
import { useTranslation } from 'react-i18next';

const Tab4: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {
    const { t } = useTranslation();
    const localize = useLocalize();

    const location = useLocation();
    const [user] = useState<User | null>(PublicCookiesService.getUser());
    const [howToPlay, setHowToPlay] = useState<HowToPlay | null>(null);

    const rules = howToPlay
        ? howToPlay.rules.map(rule => localize(rule).text)
        : t('howToPlay.rules', { returnObjects: true });
    const videoUrl = youtubeEmbedUrl(howToPlay ? howToPlay.videoUrl : DEFAULT_VIDEO_URL);

    const loadHowToPlay = () => {
        PublicSettingsService.getSettings()
            .then(settings => setHowToPlay(parseHowToPlay(settings.howToPlay)))
            .catch(error => {
                console.error("Error fetching the rules:", error);
            });
    }

    const updateShowTab2 = () => {
        PublicScheduleService.isRankingShown().then(props.setShowTab2).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const handleRefresh = async (event: CustomEvent) => {
        updateShowTab2();
        loadHowToPlay();
        await new Promise(resolve => setTimeout(resolve, 500));
        event.detail.complete();
    };

    useEffect(() => {
        updateShowTab2();
        loadHowToPlay();
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
                {videoUrl && (
                    <div className="video-wrapper">
                        <iframe
                            src={videoUrl}
                            title={t('howToPlay.videoTitle')}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
                {rules.length > 0 && (
                    <>
                        <h2>{t('howToPlay.rulesTitle')}</h2>
                        <ul>
                            {rules.map((rule, index) => (
                                <li key={`${index}-${rule}`}>{rule}</li>
                            ))}
                        </ul>
                    </>
                )}
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
