import { IonContent, IonPage, IonRefresher, IonRefresherContent, IonToast } from '@ionic/react';
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import './Tab1.css';

import 'swiper/css';
import 'swiper/css/navigation';
import { errorToastColor } from "../util/api/config/constants";
import { getSelectedGamesOption, setSelectedGamesOption } from "../util/service/dashboardService";
import { getUser } from "../util/service/loginService";

import { useLocation } from "react-router";
import { RoundDisplay } from "../components/rounds/RoundDisplay";
import { RoundHeader } from "../components/rounds/RoundHeader";
import { useRoundData } from "../hooks/useRoundData";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

const Tab1: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');
    const [showToast, setShowToast] = useState<boolean>(false);

    const location = useLocation();
    const user = getUser();

    const {
        currentRound,
        nextRound,
        noGames,
        error,
        refreshRounds
    } = useRoundData();

    const isConnected = useWebSocketConnection(refreshRounds);

    useEffect(() => {
        if (error) {
            setShowToast(true);
        }
    }, [error]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        setSelectedGamesOption(event.target.value);
    };

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            refreshRounds();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        if (selectedOption === 'Alle Spiele') {
            document.body.classList.add('all-games-selected');
        } else {
            document.body.classList.remove('all-games-selected');
        }
    }, [selectedOption]);

    useEffect(() => {
        setSelectedOption(getSelectedGamesOption() || 'Deine Spiele');
    }, [location]);

    return (
        <IonPage>
            <Header />
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="circles" />
                </IonRefresher>

                <RoundHeader
                    title="Spielplan"
                    onOptionChange={handleOptionChange}
                    selectedOption={selectedOption}
                />

                <div>
                    <RoundDisplay
                        round={currentRound}
                        title={selectedOption === 'Alle Spiele' ? 'Aktuelle Spiele' : 'Aktuelles Spiel'}
                        user={user ?? null}
                        viewType={selectedOption === 'Alle Spiele' ? 'all' : 'personal'}
                        noGames={noGames}
                    />

                    <RoundDisplay
                        round={nextRound}
                        title={selectedOption === 'Alle Spiele' ? 'Nächste Spiele' : 'Nächstes Spiel'}
                        user={user ?? null}
                        viewType={selectedOption === 'Alle Spiele' ? 'all' : 'personal'}
                        noGames={noGames}
                    />
                </div>
            </IonContent>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error || 'Ein Fehler ist aufgetreten'}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': errorToastColor
                }}
            />
        </IonPage>
    );
};

export default Tab1;