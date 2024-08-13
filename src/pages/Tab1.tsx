import {IonAvatar, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/react';
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
    const [currentRound, setCurrentRound] = useState<RoundReturnDTO>(null);
    const [nextRound, setNextRound] = useState<RoundReturnDTO>(null);
    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    let round: number;
    const [selectedOption, setSelectedOption] = useState('Deine Spiele');

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

        // TODO: neuen Endpunkt benutzen wo man die nächsten beiden Runden bekommt
        // NOTE: Denk dran, dass bei der letzten Runde auch nur 1 Runde zurückkommen kann
        // method which will save the round that is currently played aswell as the next round
        const getCurrentAndNextRound = async () => {
            try {
                // get the round which is currently played
                const roundResponse = await axios.get('http://localhost:3000/api/round');
                const round = roundResponse.data.id;

                // Get current round
                const currentRoundResponse = await axios.get(`http://localhost:3000/api/round/${round}`);
                const currentRoundData = currentRoundResponse.data as Round;
                setCurrentRound(currentRoundData);

                // get next round
                const nextRoundResponse = await axios.get(`http://localhost:3000/api/round/${round+1}`);
                const nextRoundData = nextRoundResponse.data as Round;
                setNextRound(nextRoundData);

                console.log(currentRoundData)
                console.log(nextRoundData)

            } catch (error) {
                console.log(error);
            }
        };
        const currentAndNextRound = getBothCurrentRounds();

        currentAndNextRound.then((response) => {
            response[0].endTime = response[0].endTime.split('T')[1].slice(0, 5);
            response[0].startTime = response[0].startTime.split('T')[1].slice(0, 5);
            response[1].endTime = response[1].endTime.split('T')[1].slice(0, 5);
            response[1].startTime = response[1].startTime.split('T')[1].slice(0, 5);
            setCurrentRound(response[0]);
            setNextRound(response[1]);
        }).catch((error) => {
            console.error(error);
        });

        // getCurrentAndNextRound();
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
        </IonPage>
    );
};

export default Tab1;
