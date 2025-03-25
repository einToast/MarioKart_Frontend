import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import StaticTeamGraph from '../components/graph/StaticTeamGraph';
import Header from "../components/Header";
import Toast from '../components/Toast';
import { TeamReturnDTO } from "../util/api/config/dto";
import { ShowTab2Props, User } from '../util/api/config/interfaces';
import { PublicCookiesService, PublicRegistrationService, PublicScheduleService, PublicSettingsService } from "../util/service";
import './Tab2.css';

const Tab2: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [maxNumberOfGames, setMaxNumberOfGames] = useState<number>(0);
    const [finalPlanCreated, setFinalPlanCreated] = useState<boolean>(false);

    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const location = useLocation();
    const history = useHistory();

    const getRanking = () => {
        Promise.all([
            PublicRegistrationService.getTeamsSortedByGroupPoints(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicSettingsService.getMaxGamesCount()
        ])
            .then(([teams, finalPlan, maxGames]) => {
                setTeams(teams);
                setFinalPlanCreated(finalPlan);
                setMaxNumberOfGames(maxGames);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }

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
            getRanking();
            updateShowTab2();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        setUser(PublicCookiesService.getUser());
    }, []);

    useEffect(() => {

        getRanking();
        updateShowTab2();

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
        if (!props.showTab2) {
            changeLocation();
        }
    }, [props.showTab2]);

    const changeLocation = () => {
        if (!props.showTab2) {
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
