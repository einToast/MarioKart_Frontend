import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import { ShowTab2Props, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicScheduleService, PublicSettingsService } from "../util/service";
import './Tab3.css';

const Tab4: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {

    const history = useHistory();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());

    const updateShowTab2 = () => {
        Promise.all([
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([matchPlanValue, finalPlanValue, roundsLessTwoValue]) => {
            props.setShowTab2(!matchPlanValue || finalPlanValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            updateShowTab2();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {

        updateShowTab2();

        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        })
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
                        refreshingSpinner="circles"
                    />
                </IonRefresher>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        So wird gespielt
                    </LinearGradient>
                </h1>
                <br />
                <div className="video-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/3p25Jjj6UGA?si=c4boLd7F1PqX2A7c"
                        title="YouTube Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />

                </div>
                <h2>Spielregeln</h2>
                <ul>
                    <li>Es treten 4 Teams gegeneinander an</li>
                    <li>Es wird im Versus-Rennen gespielt</li>
                    <li>Alle Teams fahren im Standard-Kart</li>
                    <li>Die Geschwindigkeit beträgt 100ccm</li>
                    <li>Es wird mit Standardeinstellungen gespielt</li>
                    <li>Die Streckenauswahl ist zufällig</li>
                    <li>Die Teams fahren 4 Rennen gegeneinander</li>
                </ul>
                <h2>Steuerung</h2>
                <h3>Pro Controller</h3>
                <div>
                    <img src={"/media/procon_how_to_play.jpg"} alt="pro controller" />
                </div>
                <h3>JoyCon</h3>
                <div>
                    <img src={"/media/joycon_how_to_play.jpg"} alt="joycon" />
                </div>
                <div style={{ marginBottom: "10px" }}></div>
            </IonContent>
        </IonPage>
    );
};

export default Tab4;
