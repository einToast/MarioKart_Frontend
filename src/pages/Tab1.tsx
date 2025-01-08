import {IonContent, IonPage, IonToast} from '@ionic/react';
import './Tab1.css';
import {LinearGradient} from 'react-text-gradients'
import Header from "../components/Header";
import '../interface/interfaces';
import {useEffect, useState} from "react";

import 'swiper/css';
import 'swiper/css/navigation';
import RoundComponentAll from "../components/RoundComponentAll";
import RoundComponentSwiper from "../components/RoundComponentSwiper";
import {getBothCurrentRounds} from "../util/service/dashboardService";
import {BreakReturnDTO, RoundReturnDTO} from "../util/api/config/dto";
import {getUser} from "../util/service/loginService";
import {errorToastColor} from "../util/api/config/constants";

import {useWebSocket} from "../components/WebSocketContext";
import {useHistory, useLocation} from "react-router";
import {getRegistrationOpen, getTournamentOpen} from "../util/service/teamRegisterService";
import ErrorCard from "../components/cards/ErrorCard";

const Tab1: React.FC = () => {
    const [currentRound, setCurrentRound] = useState<RoundReturnDTO | BreakReturnDTO>({id: 0, startTime: '', endTime: '', played: false, games: [], finalGame: false});
    const [nextRound, setNextRound] = useState<RoundReturnDTO | BreakReturnDTO>({id: 0, startTime: '', endTime: '', played: false, games: [], finalGame: false});
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');
    const [noGames, setNoGames] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const wsService = useWebSocket();

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    const getNewRounds = async () => {
        const currentAndNextRound = getBothCurrentRounds();
        let isBreakTime = false;
        currentAndNextRound.then((response) => {
            if (response[0]) {
                response[0].endTime = response[0].endTime.split('T')[1].slice(0, 5);
                response[0].startTime = response[0].startTime.split('T')[1].slice(0, 5);
                if (response[0].breakTime) {
                    response[0].breakTime.endTime = response[0].breakTime.endTime.split('T')[1].slice(0, 5);
                    response[0].breakTime.startTime = response[0].breakTime.startTime.split('T')[1].slice(0, 5);
                }
            } else {
                setNoGames(true);
            }
            if (response[0] &&response[0].breakTime && !response[0].breakTime.breakEnded) {
                setCurrentRound(response[0].breakTime);
                setNextRound(response[0]);
                isBreakTime = true;
            }
            else {
                setCurrentRound(response[0]);
            }

            if (response[1]) {
                response[1].endTime = response[1].endTime.split('T')[1].slice(0, 5);
                response[1].startTime = response[1].startTime.split('T')[1].slice(0, 5);
                if (response[1].breakTime) {
                    response[1].breakTime.endTime = response[1].breakTime.endTime.split('T')[1].slice(0, 5);
                    response[1].breakTime.startTime = response[1].breakTime.startTime.split('T')[1].slice(0, 5);
                }
            }
            if (response[1] && response[1].breakTime && !response[1].breakTime.breakEnded) {
                setNextRound(response[1].breakTime);
            }
            else if (!isBreakTime) {
                setNextRound(response[1]);
            }
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
        );
    }


    useEffect(() => {
        if (selectedOption === 'Alle Spiele') {
            document.body.classList.add('all-games-selected');
        } else {
            document.body.classList.remove('all-games-selected');
        }
    }, [selectedOption]);

    useEffect(() => {
        getNewRounds();

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
    }, [location]);


    useEffect(() => {
        getNewRounds();
        setUserCharacter(user.character);

        const checkConnection = setInterval(() => {
            if (wsService.isConnected()) {
                setIsConnected(true)
                clearInterval(checkConnection);
            }
        }, 500);

        return () => {
            clearInterval(checkConnection);
        };
    }, [wsService]);

    useEffect(() => {
        if (isConnected) {
            wsService.subscribe('/topic/rounds', (message) => {
                getNewRounds();
            });

            return () => {
                wsService.unsubscribe('/topic/rounds');
                wsService.unsubscribe('/topic/messages');
            };
        }
    }, [isConnected, wsService]);


    return (
        <IonPage>
            <Header/>
            <IonContent fullscreen>
                <div className={"flexStart"}>
                    <h1>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Spielplan
                        </LinearGradient>
                    </h1>
                    <div>
                        <select value={selectedOption} onChange={handleChange}>
                            <option>Deine Spiele</option>
                            <option>Alle Spiele</option>
                        </select>
                    </div>
                </div>

                <div>
                    {selectedOption === 'Alle Spiele' && (
                        <>
                            <div className="flexSpiel">
                                {(currentRound && typeof currentRound.played === 'boolean') ? (
                                    <>
                                        <div className="timeContainer">
                                            <h3>Aktuelle Spiele</h3>
                                            <p className="timeStamp">{currentRound.startTime} - {currentRound.endTime}</p>
                                        </div>

                                        {currentRound.games && currentRound.games.map(game => {
                                            const switchColor = game.switchGame;
                                            const hasLoggedInCharacter = game.teams.some(team => team.character.characterName === user.character);

                                            if (hasLoggedInCharacter) {
                                                const loggedInTeamIndex = game.teams.findIndex(team => team.character.characterName === user.character);
                                                const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                                                game.teams.unshift(loggedInTeam[0]);
                                            }

                                            return (
                                                <RoundComponentSwiper key={game.id} game={game} user={user}
                                                                      switchColor={switchColor}/>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <>
                                    {currentRound && !currentRound.breakEnded ? (
                                        <>
                                            <div className="timeContainer">
                                                <h3>Aktuelle Spiele</h3>
                                                <p className="timeStamp">{currentRound.startTime} - {currentRound.endTime}</p>
                                            </div>
                                            <p> It's pizza time! 🍕</p>
                                        </>
                                        ) : (
                                        <>
                                            {noGames ? (
                                                <>
                                                    <div className="timeContainer">
                                                        <h3>Aktuelle Spiele</h3>
                                                    </div>
                                                    <p>Keine Spiele gefunden.</p>
                                                </>
                                                ) : (
                                                <p>Test</p>
                                                )}
                                                </>
                                            )}
                                        </>
                                    )}
                                    </div>

                                    <div className="flexSpiel next">
                                {(nextRound && typeof nextRound.played === 'boolean') ? (
                                    <>
                                        <div className="timeContainer">
                                            <h3>Nächste Spiele</h3>
                                            <p className="timeStamp">{nextRound.startTime} - {nextRound.endTime}</p>
                                        </div>

                                        {nextRound.games && nextRound.games.map(game => {
                                            const switchColor = game.switchGame;
                                            const hasLoggedInCharacter = game.teams.some(team => team.character.characterName === user.character);

                                            if (hasLoggedInCharacter) {
                                                const loggedInTeamIndex = game.teams.findIndex(team => team.character.characterName === user.character);
                                                const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                                                game.teams.unshift(loggedInTeam[0]);
                                            }

                                            return (
                                                <RoundComponentSwiper key={game.id} game={game} user={user}
                                                                      switchColor={switchColor}/>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <>
                                        {nextRound && !nextRound.breakEnded ? (
                                            <>
                                                <div className="timeContainer">
                                                    <h3>Nächste Spiele</h3>
                                                    <p className="timeStamp">{nextRound.startTime} - {nextRound.endTime}</p>
                                                </div>
                                                <p> It's pizza time! 🍕</p>
                                            </>
                                        ) : (
                                            <>
                                                {noGames ? (
                                                    <>
                                                        <div className="timeContainer">
                                                            <h3>Nächste Spiele</h3>
                                                        </div>
                                                        <p>Keine Spiele gefunden.</p>
                                                    </>
                                                ) : (
                                                    <p></p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {selectedOption === 'Deine Spiele' && (
                        <>
                            <div className="flexSpiel">
                                {(currentRound && typeof currentRound.played === 'boolean') ? (
                                    <>
                                        <div className="timeContainer">
                                            <h3>Aktuelles Spiel</h3>
                                            <p className="timeStamp">{currentRound.startTime} - {currentRound.endTime}</p>
                                        </div>
                                        {currentRound && currentRound.games ? (
                                            (() => {
                                                const filteredGames = currentRound.games
                                                    .filter(game => game.teams.some(team => team.character.characterName === user.character)) // Filter games where logged in character is in a team
                                                    .map(game => {
                                                        const switchColor = game.switchGame;
                                                        const hasLoggedInCharacter = game.teams.some(team => team.character.characterName === user.character);

                                                        if (hasLoggedInCharacter) {
                                                            const loggedInTeamIndex = game.teams.findIndex(team => team.character.characterName === user.character);
                                                            const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                                                            game.teams.unshift(loggedInTeam[0]);
                                                        }

                                                        return (
                                                            <RoundComponentAll key={game.id} game={game} user={user}
                                                                               switchColor={switchColor}/>
                                                        );
                                                    });

                                                return filteredGames.length > 0 ? filteredGames :
                                                    <p>Du hast aktuell kein Spiel.</p>;
                                            })()
                                        ) : (
                                            <>
                                                {noGames ? (
                                                    <>
                                                        <div className="timeContainer">
                                                            <h3>Aktuelles Spiel</h3>
                                                        </div>
                                                        <p>Keine Spiele gefunden.</p>
                                                    </>
                                                ) : (
                                                    <p>loading...</p>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {currentRound && !currentRound.breakEnded ? (
                                            <>
                                                <div className="timeContainer">
                                                    <h3>Aktuelles Spiel</h3>
                                                    <p className="timeStamp">{currentRound.startTime} - {currentRound.endTime}</p>
                                                </div>
                                                <p> It's pizza time! 🍕</p>
                                            </>
                                        ) : (
                                            <>
                                                {noGames ? (
                                                    <>
                                                        <div className="timeContainer">
                                                            <h3>Aktuelles Spiel</h3>
                                                        </div>
                                                        <p>Keine Spiele gefunden.</p>
                                                    </>
                                                ) : (
                                                    <p></p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>


                            <div className="flexSpiel next">
                                {(nextRound && typeof nextRound.played === 'boolean') ? (
                                    <>
                                        <div className="timeContainer">
                                            <h3>Nächstes Spiel</h3>
                                            <p className="timeStamp">{nextRound.startTime} - {nextRound.endTime}</p>
                                        </div>
                                        {nextRound && nextRound.games ? (
                                            (() => {
                                                const filteredGames = nextRound.games
                                                    .filter(game => game.teams.some(team => team.character.characterName === user.character)) // Filter games where logged in character is in a team
                                                    .map(game => {
                                                        const switchColor = game.switchGame;
                                                        const hasLoggedInCharacter = game.teams.some(team => team.character.characterName === user.character);

                                                        if (hasLoggedInCharacter) {
                                                            const loggedInTeamIndex = game.teams.findIndex(team => team.character.characterName === user.character);
                                                            const loggedInTeam = game.teams.splice(loggedInTeamIndex, 1);
                                                            game.teams.unshift(loggedInTeam[0]);
                                                        }

                                                        return (
                                                            <RoundComponentAll key={game.id} game={game} user={user}
                                                                               switchColor={switchColor}/>
                                                        );
                                                    });

                                                return filteredGames.length > 0 ? filteredGames :
                                                    <p>Du hast aktuell kein Spiel.</p>;
                                            })()
                                        ) : (
                                            <>
                                                {noGames ? (
                                                    <p>Keine Spiele gefunden.</p>
                                                ) : (
                                                    <p>loading...</p>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {nextRound && !nextRound.breakEnded ? (
                                            <>
                                                <div className="timeContainer">
                                                    <h3>Nächstes Spiel</h3>
                                                    <p className="timeStamp">{nextRound.startTime} - {nextRound.endTime}</p>
                                                </div>
                                                <p> It's pizza time! 🍕</p>
                                            </>
                                        ) : (
                                            <>
                                                {noGames ? (
                                                    <>
                                                        <div className="timeContainer">
                                                            <h3>Nächstes Spiel</h3>
                                                        </div>
                                                        <p>Keine Spiele gefunden.</p>
                                                    </>
                                                        ) : (
                                                        <p> </p>
                                                )}
                                            </>
                                        )}
                                    </>
                                    )}
                            </div>
                        </>
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

export default Tab1;