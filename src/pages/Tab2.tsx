import {IonContent, IonPage, IonRefresher, IonRefresherContent, IonToast} from '@ionic/react';
import './Tab2.css';
import React, {useEffect, useState} from "react";
import '../interface/interfaces';
import {LinearGradient} from "react-text-gradients";
import Header from "../components/Header";
import {TeamReturnDTO} from "../util/api/config/dto";
import {getNumberOfUnplayedRounds, getTeamsRanked} from "../util/service/dashboardService";
import {getUser} from "../util/service/loginService";
import {errorToastColor} from "../util/api/config/constants";
import {checkFinal, checkMatch} from "../util/service/adminService";
import {useHistory, useLocation} from "react-router";
import {getTournamentOpen} from "../util/service/teamRegisterService";

const Tab2: React.FC = () => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [final, setFinal] = useState<boolean>(false);
    const [roundsToPlay, setRoundsToPlay] = useState<number>(8);
    const [matchPlanCreated, setMatchPlanCreated] = useState<boolean>(false);
    const [finalPlanCreated, setFinalPlanCreated] = useState<boolean>(false);

    const user = getUser();
    const location = useLocation();
    const history = useHistory();

    const getRanking = async () => {
        const finalCheck = checkFinal();

        const teamsRanked = getTeamsRanked();

        const matchplan = checkMatch();
        const finalplan = checkFinal();
        const rounds = getNumberOfUnplayedRounds();

        finalCheck.then((result) => {
            setFinal(result);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        teamsRanked.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        matchplan.then(value => {
            setMatchPlanCreated(value);
        })

        finalplan.then(value => {
            setFinalPlanCreated(value);
        })

        rounds.then(value => {
            setRoundsToPlay(value);
        })
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            getRanking();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {
        setUserCharacter(user.character);

        getRanking();

        const tournamentOpen = getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

    },[location]);

    useEffect(() => {
        if (matchPlanCreated && !finalPlanCreated && roundsToPlay < 2) {
            changeLocation();
        }
    }, [matchPlanCreated, finalPlanCreated, roundsToPlay]);

    const changeLocation = () => {
        if (matchPlanCreated && !finalPlanCreated && roundsToPlay < 2) {
            setError("Die Statistiken können momentan nicht angezeigt werden.");
            setToastColor(errorToastColor);
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
                <div className={"flexContainer"}>
                    {teams ? (
                        teams
                            .map((team, index) => (
                                <div key={team.id} className={`teamContainer ${userCharacter === team.character?.characterName ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`/characters/${team.character?.characterName}.png`} alt={team.character?.characterName}
                                             className={"iconTeam"}/>
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        <p className={"punkte"}>{index + 1}. Platz</p>
                                        {final ? (
                                            <p className={"punkte"}>{team.groupPoints} Punkte</p>
                                        ) : (
                                            ""
                                        )}

                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default Tab2;
