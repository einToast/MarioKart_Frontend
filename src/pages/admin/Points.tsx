import {
    IonAccordionGroup,
    IonButton,
    IonCheckbox,
    IonContent,
    IonIcon,
    IonPage, IonToast
} from "@ionic/react";
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import PointsCard from "../../components/cards/PointsCard";
import "../../interface/interfaces";
import { LoginProps } from "../../interface/interfaces";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { RoundReturnDTO } from "../../util/api/config/dto";
import { saveRound } from "../../util/service/adminService";
import { getAllRounds, getRound } from "../../util/service/dashboardService";
import { checkToken, getUser } from "../../util/service/loginService";
import "../RegisterTeam.css";
import "./Points.css";


const Points: React.FC<LoginProps> = (props: LoginProps) => {
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [round, setRound] = useState<RoundReturnDTO>({ id: -1, startTime: '2025-01-08T20:35:32.271488', endTime: '2025-01-08T20:35:32.271488', played: false, games: [], finalGame: false });
    const [numberOfRounds, setNumberOfRounds] = useState<number>(0);
    const [roundPlayed, setRoundPlayed] = useState<boolean>(false);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    const getSelectedRound = (roundNumber: number) => {
        const round = getRound(roundNumber);
        round.then((round) => {
            round.games = round.games?.sort((a, b) => a.id - b.id) || [];
            setRound(round);
            setRoundPlayed(round.played);
            setOpenAccordions([]); // Close all accordions initially
        });
    };

    const handleSavePoints = async () => {
        try {
            const savedRound = await saveRound(round);

            if (savedRound) {
                setError('Runde erfolgreich gespeichert');
                setToastColor(successToastColor)
                setShowToast(true);
            } else {
                throw new TypeError('Runde konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
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
            getSelectedRound(rounds.find(round => !round.played)?.id || rounds[rounds.length - 1].id);
            setNumberOfRounds(rounds.length);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
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
                        <select name="round" id="round" onChange={(e) => getSelectedRound(parseInt(e.target.value))}>
                            {Array.from(Array(numberOfRounds).keys()).map((round_number) => {
                                return <option value={round_number + 1} key={round_number + 1} selected={round_number + 1 === round.id}>Runde {round_number + 1}</option>
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
                            {round.games?.map((game) => (
                                game.teams = game.teams?.sort((a, b) => a.id - b.id) || [],
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
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default Points;
