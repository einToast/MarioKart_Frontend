import {
    IonAccordionGroup,
    IonButton,
    IonCheckbox,
    IonContent,
    IonIcon,
    IonPage
} from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import PointsComponent from "../../components/admin/PointsComponent";
import Toast from '../../components/Toast';
import { RoundReturnDTO } from "../../util/api/config/dto";
import { AdminScheduleService, PublicUserService } from "../../util/service";
import "../RegisterTeam.css";
import "./Points.css";

const Points: React.FC = () => {
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [round, setRound] = useState<RoundReturnDTO>({ id: -1, roundNumber: -1, startTime: '2025-01-08T20:35:32.271488', endTime: '2025-01-08T20:35:32.271488', played: false, games: [], finalGame: false });
    const [numberOfRounds, setNumberOfRounds] = useState<number>(0);
    const [roundPlayed, setRoundPlayed] = useState<boolean>(false);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const user = PublicUserService.getUser();
    const history = useHistory();
    const location = useLocation();

    const getSelectedRound = (id: number) => {
        const round = AdminScheduleService.getRoundById(id);
        round.then((round) => {
            round.games = round.games?.sort((a, b) => a.id - b.id) || [];
            setRound(round);
            setRoundPlayed(round.played);
            setOpenAccordions([]); // Close all accordions initially
        });
    };

    const handleSavePoints = () => {
        AdminScheduleService.saveRound(round)
            .then(savedRound => {
                if (savedRound) {
                    setError('Runde erfolgreich gespeichert');
                    setIsError(false);
                } else {
                    setError('Runde konnte nicht gespeichert werden');
                    setIsError(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
            })
            .finally(() => {
                setShowToast(true);
            });
    };

    useEffect(() => {
        if (!PublicUserService.checkToken()) {
            window.location.assign('/admin/login');
        }

        const rounds = AdminScheduleService.getRounds();
        rounds.then((rounds) => {
            rounds = rounds.sort((a, b) => a.roundNumber - b.roundNumber);
            getSelectedRound(rounds.find(round => !round.played)?.id || rounds[rounds.length - 1].id);
            setNumberOfRounds(rounds.length);
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [location]);

    const toggleAccordion = (accordionId: string) => {
        setOpenAccordions(prevOpenAccordions =>
            prevOpenAccordions.includes(accordionId)
                ? prevOpenAccordions.filter(id => id !== accordionId) // Remove the accordion from the list
                : [...prevOpenAccordions, accordionId] // Add the accordion to the list
        );
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            history.push('/admin/dashboard');
                        }
                    }}
                >
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <div className={"flexStart"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Punkte eintragen
                        </LinearGradient>
                    </h2>
                    <div>
                        <select 
                            name="round" 
                            id="round" 
                            value={round.roundNumber} 
                            onChange={(e) => getSelectedRound(parseInt(e.target.value))}
                        >
                            {Array.from(Array(numberOfRounds).keys()).map((round_number) => {
                                const roundNum = round_number + 1;
                                const isFinalRound = round.roundNumber === roundNum && round.finalGame;
                                
                                return (
                                    <option value={roundNum} key={roundNum}>
                                        {isFinalRound ? 'Finale' : `Runde ${roundNum}`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
                {round && (
                    <>
                        <div className="timeContainer">
                            <p className="timeStamp">{round.startTime.split('T')[1].slice(0, 5)} - {round.endTime.split('T')[1].slice(0, 5)}</p>
                        </div>
                        <IonAccordionGroup ref={accordionGroupRef} value={openAccordions}>
                            {round.games.map((game) => (
                                game.teams = game.teams.sort((a, b) => a.id - b.id) || [],
                                <PointsComponent
                                    key={game.id}
                                    game={game}
                                    roundId={round.id}
                                    isOpen={openAccordions.includes(game.id.toString())}
                                    toggleAccordion={() => toggleAccordion(game.id.toString())}
                                />
                            ))}
                        </IonAccordionGroup>
                    </>
                )}

                <div className={"playedContainer"}>
                    <IonCheckbox labelPlacement="end"
                        checked={roundPlayed}
                        onIonChange={(e) => {
                            setRoundPlayed(e.detail.checked);
                            round.played = e.detail.checked;
                        }}
                    >
                        Runde gespielt
                    </IonCheckbox>

                    <IonButton slot="start" shape="round" className={"round"} onClick={handleSavePoints}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSavePoints()
                            }
                        }}
                    >
                        <div>
                            <p>Punkte speichern</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </IonPage>
    );
};

export default Points;
