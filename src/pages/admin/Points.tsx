import { IonAccordionGroup, IonButton, IonCheckbox, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import PointsComponent from "../../components/admin/PointsComponent";
import Toast from '../../components/Toast';
import { RoundReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { AdminScheduleService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import "../RegisterTeam.css";
import "./Points.css";

const Points: React.FC = () => {
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [round, setRound] = useState<RoundReturnDTO>({ id: -1, roundNumber: -1, startTime: '2025-01-08T20:35:32.271488', endTime: '2025-01-08T20:35:32.271488', played: false, games: [], finalGame: false });
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);
    const [rounds, setRounds] = useState<RoundReturnDTO[]>([]); // Alle Runden speichern
    const [roundPlayed, setRoundPlayed] = useState<boolean>(false);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const location = useLocation();

    const getSelectedRound = (id: number) => {
        const round = AdminScheduleService.getRoundById(id);
        round.then((round) => {
            round.games ??= [];
            round.games.sort((a, b) => a.id - b.id);
            round.games.forEach(game => game.teams.sort((a, b) => a.id - b.id));
            setRound(round);
            setRoundPlayed(round.played);
            setOpenAccordions([]); // Close all accordions initially
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    };

    const handleSavePoints = () => {
        // AdminScheduleService.saveRound(round)
        AdminScheduleService.saveRoundFull(round)
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
        const loadRounds = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            // Without the switches the games are numbered, so a failed request is not an error
            PublicSettingsService.getSwitches()
                .then(setSwitches)
                .catch(error => console.error("Error fetching switches:", error));

            const roundsPromise = AdminScheduleService.getRounds();
            roundsPromise.then((rounds) => {
                rounds.sort((a, b) => a.roundNumber - b.roundNumber);
                setRounds(rounds);
                const selectedRound = rounds.find(round => !round.played) ?? rounds.at(-1);
                if (selectedRound) {
                    getSelectedRound(selectedRound.id);
                }
            }).catch((error) => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
        };

        loadRounds().catch(error => {
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
                <BackLink />
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
                            onChange={(e) => getSelectedRound(Number.parseInt(e.target.value))}
                        >
                            {(() => {
                                let finalCount = 0;
                                return rounds.map((r) => {
                                    if (r.finalGame) finalCount++;
                                    return (
                                        <option value={r.roundNumber} key={r.roundNumber}>
                                            {r.finalGame ? `Finale ${finalCount}` : `Runde ${r.roundNumber}`}
                                        </option>
                                    );
                                });
                            })()}
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
                                <PointsComponent
                                    key={game.id}
                                    game={game}
                                    roundId={round.id}
                                    switches={switches}
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
