import {IonAvatar, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToast, IonToolbar} from '@ionic/react';
import './Tab1.css';
import {LinearGradient} from 'react-text-gradients'
import Header from "../components/Header";
import axios from "axios";
import '../interface/interfaces';
import {useEffect, useState} from "react";

import 'swiper/css';
import 'swiper/css/navigation';
import {Navigation} from 'swiper/modules';
import RoundComponentAll from "../components/RoundComponentAll";
import RoundComponentSwiper from "../components/RoundComponentSwiper";
import {Swiper, SwiperSlide} from "swiper/react";
import {getBothCurrentRounds} from "../util/service/dashboardService";
import {RoundReturnDTO} from "../util/api/config/dto";

const Tab1: React.FC = () => {
    const [currentRound, setCurrentRound] = useState<RoundReturnDTO>();
    const [nextRound, setNextRound] = useState<RoundReturnDTO>();
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');

    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>('#CD7070');
    const [showToast, setShowToast] = useState(false);

    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    let round: number;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {
        if (selectedOption === 'Alle Spiele') {
            document.body.classList.add('all-games-selected');
        } else {
            document.body.classList.remove('all-games-selected');
        }
    }, [selectedOption]);


    useEffect(() => {
        const currentAndNextRound = getBothCurrentRounds();

        currentAndNextRound.then((response) => {
            console.log(response);
            if (response[0]) {
                response[0].endTime = response[0].endTime.split('T')[1].slice(0, 5);
                response[0].startTime = response[0].startTime.split('T')[1].slice(0, 5);
            }
            setCurrentRound(response[0]);
            if (response[1]) {
                response[1].endTime = response[1].endTime.split('T')[1].slice(0, 5);
                response[1].startTime = response[1].startTime.split('T')[1].slice(0, 5);
            }
            setNextRound(response[1]);
        }).catch((error) => {
            console.error(error);
            setError('Fehler beim Laden der Spiele');
            setToastColor('#CD7070');
            setShowToast(true);
        });

        setUserCharacter(user.character);
    }, [])

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
                                {currentRound ? (
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
                                    <p>loading...</p>
                                )}
                            </div>

                            <div className="flexSpiel next">
                                {nextRound ? (
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
                                    <p>loading...</p>
                                )}
                            </div>
                        </>
                    )}

                    {selectedOption === 'Deine Spiele' && (
                        <>
                            <div className="flexSpiel">
                                {currentRound ? (
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
                                            <p>loading...</p>
                                        )}
                                    </>
                                ) : (
                                    <p>loading...</p>
                                )}
                            </div>


                            <div className="flexSpiel next">
                                {nextRound ? (
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
                                            <p>loading...</p>
                                        )}
                                    </>
                                ) : (
                                    <p>loading...</p>
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
