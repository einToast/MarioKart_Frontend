import React, { useEffect, useRef, useState } from "react";
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonCheckbox,
    IonContent,
    IonIcon,
    IonItem,
    IonPage, IonToast
} from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory } from "react-router";
import { LinearGradient } from "react-text-gradients";
import PointsCard from "../../components/PointsCard";
import { getAllRounds, getRound } from "../../util/service/dashboardService";
import {saveRound} from "../../util/service/adminService";
import "../../interface/interfaces";
import "../RegisterTeam.css";
import "./Points.css";
import { RoundReturnDTO } from "../../util/api/config/dto";
import {checkToken} from "../../util/service/loginService";

const Points: React.FC<LoginProps> = (props: LoginProps) => {
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [round, setRound] = useState<RoundReturnDTO | null>(null);
    const [numberOfRounds, setNumberOfRounds] = useState<number>(0);
    const [roundPlayed, setRoundPlayed] = useState<boolean>(false);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array
    const [error, setError] = useState<string | null>(null);
    const [toastColor, setToastColor] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();

    const getSelectedRound = (roundNumber: number) => {
        const round = getRound(roundNumber);
        round.then((round) => {
            round.games = round.games.sort((a, b) => a.id - b.id);
            setRound(round);
            setRoundPlayed(round.played);
            setOpenAccordions([]); // Close all accordions initially
        });
    };

    const handleSavePoints = async () => {
        try {
            const savedRound = await saveRound(round);

            if (savedRound) {
                setShowToast(true);
                setError('Runde erfolgreich gespeichert');
            } else {
                throw new TypeError('Runde konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error);
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const rounds = getAllRounds();
        rounds.then((rounds) => {
            rounds = rounds.sort((a, b) => a.id - b.id);
            getSelectedRound(rounds[0].id);
            setNumberOfRounds(rounds.length);
        });
    }, []);

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
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
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
                        <select name="round" id="round" onChange={(e) => getSelectedRound(parseInt(e.target.value))}>
                            {Array.from(Array(numberOfRounds).keys()).map((round) => {
                                return <option value={round + 1} key={round + 1}>Runde {round + 1}</option>;
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
                            {round.games?.map((game, index) => (
                                game.teams = game.teams.sort((a, b) => a.id - b.id),
                                <PointsCard
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

                    <IonButton slot="start" shape="round" className={"round"} onClick={handleSavePoints}>
                        <div>
                            <p>Punkte speichern</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
            />
        </IonPage>
    );
};

export default Points;
