import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import './Tab1.css';

import 'swiper/css';
import 'swiper/css/navigation';
// import { getSelectedGamesOption, setSelectedGamesOption } from "../util/service/dashboardService";
import { useLocation } from "react-router";
import { RoundDisplay } from "../components/rounds/RoundDisplay";
import { RoundHeader } from "../components/rounds/RoundHeader";
import Toast from '../components/Toast';
import { useRoundData } from "../hooks/useRoundData";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { User } from '../util/api/config/interfaces';
import { PublicCookiesService } from '../util/service';

const Tab1: React.FC = () => {
    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');

    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const location = useLocation();

    const {
        currentRound,
        nextRound,
        teamsNotInCurrentRound,
        teamsNotInNextRound,
        error,
        refreshRounds
    } = useRoundData();

    const isConnected = useWebSocketConnection(refreshRounds);

    useEffect(() => {
        setUser(PublicCookiesService.getUser());
    }, []);

    useEffect(() => {
        if (error) {
            setShowToast(true);
        }
    }, [error]);

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        PublicCookiesService.setSelectedGamesOption(event.target.value);
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
        setSelectedOption(PublicCookiesService.getSelectedGamesOption() || 'Deine Spiele');
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
                        teamsNotInRound={teamsNotInCurrentRound}
                    />

                    <RoundDisplay
                        round={nextRound}
                        title={selectedOption === 'Alle Spiele' ? 'Nächste Spiele' : 'Nächstes Spiel'}
                        user={user ?? null}
                        viewType={selectedOption === 'Alle Spiele' ? 'all' : 'personal'}
                        teamsNotInRound={teamsNotInNextRound}
                    />
                </div>
            </IonContent>

            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            ></Toast>
        </IonPage>
    );
};

export default Tab1;