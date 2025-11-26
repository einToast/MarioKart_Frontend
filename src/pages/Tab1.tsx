import { IonCheckbox, IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import './Tab1.css';

import { useLocation } from "react-router";
import 'swiper/css';
import 'swiper/css/navigation';
import { RoundDisplay } from "../components/rounds/RoundDisplay";
import { RoundHeader } from "../components/rounds/RoundHeader";
import Toast from '../components/Toast';
import { useRoundData } from "../hooks/useRoundData";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { ShowTab2Props, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicScheduleService } from '../util/service';

const Tab1: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {
    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');

    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const [loading, setLoading] = useState<boolean>(false);

    const location = useLocation();

    const {
        currentRound,
        nextRound,
        teamsNotInCurrentRound,
        teamsNotInNextRound,
        error,
        refreshRounds
    } = useRoundData();

    const isConnected = useWebSocketConnection('/topic/rounds', refreshRounds);

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        PublicCookiesService.setSelectedGamesOption(event.target.value);
    };

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
        setLoading(true);
        
        await Promise.all([
        refreshRounds(),
        updateShowTab2(),
        new Promise(resolve => setTimeout(resolve, 500)),
        ]);

        setLoading(false);
        event.detail.complete();
    };

    useEffect(() => {
        setUser(PublicCookiesService.getUser());
        updateShowTab2();
    }, []);

    useEffect(() => {
        if (error) {
            setShowToast(true);
        }
    }, [error]);

    useEffect(() => {
        // if (currentRound !== null || nextRound !== null || error) {
        //     setLoading(false);
        // }
    }, [currentRound, nextRound, error]);

    useEffect(() => {
        if (selectedOption === 'Alle Spiele') {
            document.body.classList.add('all-games-selected');
        } else {
            document.body.classList.remove('all-games-selected');
        }
    }, [selectedOption]);

    useEffect(() => {
        setSelectedOption(PublicCookiesService.getSelectedGamesOption() || 'Deine Spiele');
        updateShowTab2();
    }, [location]);

    return (
        <IonPage>
            <Header />
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="crescent" />
                </IonRefresher>

                <RoundHeader
                    title="Spielplan"
                    onOptionChange={handleOptionChange}
                    selectedOption={selectedOption}
                    loading={loading}
                />
                <div>
                    <RoundDisplay
                        round={currentRound}
                        title={selectedOption === 'Alle Spiele' ? 'Aktuelle Spiele' : 'Aktuelles Spiel'}
                        user={user ?? null}
                        viewType={selectedOption === 'Alle Spiele' ? 'all' : 'personal'}
                        teamsNotInRound={teamsNotInCurrentRound}
                        loading={loading}
                    />

                    <RoundDisplay
                        round={nextRound}
                        title={selectedOption === 'Alle Spiele' ? 'Nächste Spiele' : 'Nächstes Spiel'}
                        user={user ?? null}
                        viewType={selectedOption === 'Alle Spiele' ? 'all' : 'personal'}
                        teamsNotInRound={teamsNotInNextRound}
                        loading={loading}
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
