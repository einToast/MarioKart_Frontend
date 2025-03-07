import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import { getTournamentOpen } from "../util/service/teamRegisterService";
import './Tab3.css';

const Tab4: React.FC = () => {

    const history = useHistory();
    const location = useLocation();

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        const tournamentOpen = getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        })
    }, [location])

    return (
        <IonPage>
            <Header></Header>
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        refreshingSpinner="circles"
                    />
                </IonRefresher>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Wie wird gespielt?
                    </LinearGradient>
                </h1>
                <h3>Pro Controller</h3>
                <div>
                    <img src={"/media/procon_how_to_play.jpg"} alt="pro controller" />
                </div>
                <h3>JoyCon</h3>
                <div>
                    <img src={"/media/joycon_how_to_play.jpg"} alt="joycon" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab4;
