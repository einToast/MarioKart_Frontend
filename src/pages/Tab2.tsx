import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import StaticTeamGraph from '../components/graph/StaticTeamGraph';
import Header from "../components/Header";
import Toast from '../components/Toast';
import { TeamReturnDTO } from "../util/api/config/dto";
import { PublicRegistrationService, PublicScheduleService, PublicSettingsService, PublicUserService } from "../util/service";
import './Tab2.css';

// TODO: when last round use Props to tell it App.tsx
const Tab2: React.FC = () => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [maxNumberOfGames, setMaxNumberOfGames] = useState<number>(0);
    const [isRoundsUnplayedLessThanTwo, setIsRoundsUnplayedLessThanTwo] = useState<boolean>(false);
    const [matchPlanCreated, setMatchPlanCreated] = useState<boolean>(false);
    const [finalPlanCreated, setFinalPlanCreated] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();
    const location = useLocation();
    const history = useHistory();

    const getRanking = async () => {

        const teamsRanked = PublicRegistrationService.getTeamsSortedByGroupPoints();

        const matchplan = PublicScheduleService.isMatchPlanCreated();
        const finalplan = PublicScheduleService.isFinalPlanCreated();
        const isRoundsLessTwo = PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo();
        const maxGames = PublicSettingsService.getMaxGamesCount();

        //TODO: catch error everywhere
        teamsRanked.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });

        matchplan.then(value => {
            setMatchPlanCreated(value);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        })

        finalplan.then(value => {
            setFinalPlanCreated(value);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        })

        isRoundsLessTwo.then(value => {
            setIsRoundsUnplayedLessThanTwo(value);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        })

        maxGames.then(value => {
            setMaxNumberOfGames(value);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        })
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            getRanking();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {

        getRanking();

        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });

    }, [location]);

    useEffect(() => {
        if (matchPlanCreated && !finalPlanCreated && isRoundsUnplayedLessThanTwo) {
            changeLocation();
        }
    }, [matchPlanCreated, finalPlanCreated, isRoundsUnplayedLessThanTwo]);

    const changeLocation = () => {
        if (matchPlanCreated && !finalPlanCreated && isRoundsUnplayedLessThanTwo) {
            setError("Die Statistiken können momentan nicht angezeigt werden.");
            setShowToast(true);
            history.push('/tab1');
        }
    }

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
                        Rangliste
                    </LinearGradient>
                </h1>
                {finalPlanCreated ? (
                    <StaticTeamGraph teams={teams} />
                ) : (
                    <></>
                )}
                <div className={"flexContainer"}>
                    {teams ? (
                        teams
                            .map((team, index) => (
                                <div key={team.id} className={`teamContainer ${team.id === user?.teamId ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`/characters/${team.character.characterName}.png`} alt={team.character.characterName}
                                            className={"iconTeam"} />
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        <p className={"punkte"}>{index + 1}. Platz</p>
                                        {finalPlanCreated ? (
                                            <p className={"punkte"}>{team.groupPoints} Punkte</p>
                                        ) : (
                                            <p className={"punkte"}>{team.numberOfGamesPlayed}/{maxNumberOfGames} Spiele</p>
                                        )}

                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
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

export default Tab2;
