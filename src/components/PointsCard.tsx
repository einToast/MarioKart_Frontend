import React, { useState } from "react";
import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem, IonToast
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import { GameReturnDTO, PointsReturnDTO } from "../util/api/config/dto";
import { convertUmlauts } from "../util/service/util";
import "../pages/admin/Points.css";
import {saveGame} from "../util/service/adminService";

const PointsCard: React.FC<{ game: GameReturnDTO, roundId: number, isOpen: boolean, toggleAccordion: () => void }> = ({ game, roundId, isOpen, toggleAccordion }) => {
    const [pointsOne, setPointsOne] = useState<number>(game.points.find(point => point.team.id === game.teams[0].id).points);
    const [pointsTwo, setPointsTwo] = useState<number>(game.points.find(point => point.team.id === game.teams[1].id).points);
    const [pointsThree, setPointsThree] = useState<number>(game.points.find(point => point.team.id === game.teams[2].id).points);
    const [pointsFour, setPointsFour] = useState<number>(game.points.find(point => point.team.id === game.teams[3].id).points);
    const [error, setError] = useState<string | null>(null);
    const [toastColor, setToastColor] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const handleChangePoints = (points: PointsReturnDTO, event: any, index: number) => {
        const newValue = parseInt(event.target.value);

        if (index === 0) {
            setPointsOne(newValue);
        } else if (index === 1) {
            setPointsTwo(newValue);
        } else if (index === 2) {
            setPointsThree(newValue);
        } else if (index === 3) {
            setPointsFour(newValue);
        }

        points.points = newValue; // Update the points object directly
    };

    const handleSavePoints = async () => {
        try {
            const newPoints = await saveGame(roundId, game);
            if (newPoints) {
                setShowToast(true);
                setError('Spiel erfolgreich gespeichert');
            } else {
                throw new TypeError('Spiel konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error);
            setShowToast(true);
        }

    }

    return (
        <IonAccordion value={game.id.toString()} onIonChange={toggleAccordion} isOpen={isOpen}>
            <IonItem slot="header" color="light">
                <h3 className={convertUmlauts(game.switchGame).toLowerCase()}>Switch {game.switchGame}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsOne}
                            onChange={(e) => handleChangePoints(game.points.find(point => point.team.id === game.teams[0].id), e, 0)}
                        />
                        <img src={`./resources/media/${game.teams[0].character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsTwo}
                            onChange={(e) => handleChangePoints(game.points.find(point => point.team.id === game.teams[1].id), e, 1)}
                        />
                        <img src={`./resources/media/${game.teams[1].character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsThree}
                            onChange={(e) => handleChangePoints(game.points.find(point => point.team.id === game.teams[2].id), e, 2)}
                        />
                        <img src={`./resources/media/${game.teams[2].character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsFour}
                            onChange={(e) => handleChangePoints(game.points.find(point => point.team.id === game.teams[3].id), e, 3)}
                        />
                        <img src={`./resources/media/${game.teams[3].character.characterName}.png`} alt="Character" />
                    </div>
                </div>
                <IonButton slot="start" shape="round" onClick={handleSavePoints}>
                    <div>
                        <p>Spiel speichern</p>
                        <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                    </div>
                </IonButton>
            </div>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
            />
        </IonAccordion>
    );
};

export default React.memo(PointsCard);
