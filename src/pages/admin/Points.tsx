import { IonAccordionGroup, IonButton, IonCheckbox, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import PointsComponent from "../../components/admin/PointsComponent";
import Toast from '../../components/Toast';
import { RoundReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { AdminOcrService, AdminScheduleService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import "../RegisterTeam.css";
import "./Points.css";

const NO_ROUNDS = 'Es gibt noch keine Runden. Erstelle zuerst einen Spielplan.';

const Points: React.FC = () => {
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [round, setRound] = useState<RoundReturnDTO | null>(null);
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);
    const [rounds, setRounds] = useState<RoundReturnDTO[]>([]); 
    const [roundPlayed, setRoundPlayed] = useState<boolean>(false);
    const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);
    const [ocrProviders, setOcrProviders] = useState<string[]>([]);
    const [selectedOcrProvider, setSelectedOcrProvider] = useState<string>('');
    const [standardOcrProvider, setStandardOcrProvider] = useState<string>('');
    const ocrProvider = selectedOcrProvider || (ocrProviders.includes(standardOcrProvider) ? standardOcrProvider : ocrProviders[0] ?? '');

    const location = useLocation();

    const getSelectedRound = (id: number) => {
        const round = AdminScheduleService.getRoundById(id);
        round.then((round) => {
            round.games ??= [];
            round.games.sort((a, b) => a.id - b.id);
            round.games.forEach(game => {
                game.teams.sort((a, b) => a.id - b.id);
            });
            setRound(round);
            setRoundPlayed(round.played);
            setOpenAccordion(undefined); // Close all accordions initially
        }).catch((error) => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    };

    const handleSavePoints = () => {
        if (!round) {
            setError(NO_ROUNDS);
            setIsError(true);
            setShowToast(true);
            return;
        }

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
            PublicSettingsService.getSettings()
                .then(settings => {
                    setSwitches(settings.switches ?? []);
                    setStandardOcrProvider(settings.ocrProvider ?? '');
                })
                .catch(error => console.error("Error fetching settings:", error));

            // Without a provider the points are typed in, so a failed request is not an error
            AdminOcrService.getAvailableProviders()
                .then(setOcrProviders)
                .catch(error => console.error("Error fetching OCR providers:", error));

            const roundsPromise = AdminScheduleService.getRounds();
            roundsPromise.then((rounds) => {
                rounds.sort((a, b) => a.roundNumber - b.roundNumber);
                setRounds(rounds);
                const selectedRound = rounds.find(round => !round.played) ?? rounds.at(-1);
                if (selectedRound) {
                    getSelectedRound(selectedRound.id);
                } else {
                    setRound(null);
                    setError(NO_ROUNDS);
                    setIsError(true);
                    setShowToast(true);
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
        setOpenAccordion(previous => previous === accordionId ? undefined : accordionId);
    };

    const handleAccordionChange = (event: CustomEvent<{ value?: string | string[] | null }>) => {
        // Elements inside of a game report changes with the same event
        if (event.target !== accordionGroupRef.current) {
            return;
        }

        const value = event.detail.value;
        setOpenAccordion((Array.isArray(value) ? value[0] : value) ?? undefined);
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
                            value={round?.id ?? ''}
                            onChange={(e) => getSelectedRound(Number.parseInt(e.target.value))}
                        >
                            {(() => {
                                let finalCount = 0;
                                return rounds.map((r) => {
                                    if (r.finalGame) finalCount++;
                                    return (
                                        <option value={r.id} key={r.id}>
                                            {r.finalGame ? `Finale ${finalCount}` : `Runde ${r.roundNumber}`}
                                        </option>
                                    );
                                });
                            })()}
                        </select>
                    </div>
                </div>
                {ocrProviders.length > 0 && (
                    <div className="ocrProvider">
                        <label htmlFor="ocrProvider">Punkteerkennung:</label>
                        <select
                            name="ocrProvider"
                            id="ocrProvider"
                            value={ocrProvider}
                            onChange={(e) => setSelectedOcrProvider(e.target.value)}
                        >
                            {ocrProviders.map((provider) => (
                                <option value={provider} key={provider}>{provider === standardOcrProvider ? `${provider} (Standard)` : provider}</option>
                            ))}
                        </select>
                    </div>
                )}
                {round && (
                    <>
                        <div className="timeContainer">
                            <p className="timeStamp">{round.startTime.split('T')[1].slice(0, 5)} - {round.endTime.split('T')[1].slice(0, 5)}</p>
                        </div>
                        <IonAccordionGroup ref={accordionGroupRef} value={openAccordion} onIonChange={handleAccordionChange}>
                            {round.games.map((game) => (
                                <PointsComponent
                                    key={game.id}
                                    game={game}
                                    roundId={round.id}
                                    switches={switches}
                                    ocrProvider={ocrProvider || undefined}
                                    isOpen={openAccordion === game.id.toString()}
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
                            if (round) {
                                round.played = e.detail.checked;
                            }
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
