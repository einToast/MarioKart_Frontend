import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from "react";
import "../../pages/admin/Points.css";
import { GameReturnDTO, PointsReturnDTO } from "../../util/api/config/dto";
import { AdminScheduleService } from "../../util/service";
import { convertUmlauts } from "../../util/service/util";
import Toast from "../Toast";

const PointsComponent: React.FC<{ game: GameReturnDTO, roundId: number, isOpen: boolean, toggleAccordion: () => void }> = ({ game, roundId, isOpen, toggleAccordion }) => {
    const [pointsOne, setPointsOne] = useState<number>(game.points?.find(point => point.team.id === game.teams[0].id)?.points ?? 0);
    const [pointsTwo, setPointsTwo] = useState<number>(game.points?.find(point => point.team.id === game.teams[1].id)?.points ?? 0);
    const [pointsThree, setPointsThree] = useState<number>(game.points?.find(point => point.team.id === game.teams[2].id)?.points ?? 0);
    const [pointsFour, setPointsFour] = useState<number>(game.points?.find(point => point.team.id === game.teams[3].id)?.points ?? 0);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

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

        points.points = newValue;
    };

    const handleSavePoints = () => {
        AdminScheduleService.saveGame(roundId, game)
            .then(newPoints => {
                if (newPoints) {
                    setError('Spiel erfolgreich gespeichert');
                    setIsError(false);
                } else {
                    setError('Das Spiel konnte nicht gespeichert werden.');
                    setIsError(true);
                }
            })
            .catch(error => {
                setError(`Fehler beim Speichern: ${error.message}`);
                setIsError(true);
            })
            .finally(() => {
                setShowToast(true);
            });
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
                            onChange={(e) => handleChangePoints(game.points?.find(point => point.team.id === game.teams[0]?.id) ?? {} as PointsReturnDTO, e, 0)}
                        />
                        <img src={`/characters/${game.teams[0]?.character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsTwo}
                            onChange={(e) => handleChangePoints(game.points?.find(point => point.team.id === game.teams[1]?.id) ?? {} as PointsReturnDTO, e, 1)}
                        />
                        <img src={`/characters/${game.teams[1]?.character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsThree}
                            onChange={(e) => handleChangePoints(game.points?.find(point => point.team.id === game.teams[2]?.id) ?? {} as PointsReturnDTO, e, 2)}
                        />
                        <img src={`/characters/${game.teams[2]?.character.characterName}.png`} alt="Character" />
                    </div>
                    <div className={"characterInput"}>
                        <input
                            type={"number"}
                            value={pointsFour}
                            onChange={(e) => handleChangePoints(game.points?.find(point => point.team.id === game.teams[3]?.id) ?? {} as PointsReturnDTO, e, 3)}
                        />
                        <img src={`/characters/${game.teams[3]?.character.characterName}.png`} alt="Character" />
                    </div>
                </div>
                <IonButton slot="start" shape="round" onClick={handleSavePoints}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleSavePoints();
                        }
                    }}
                >
                    <div>
                        <p>Spiel speichern</p>
                        <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                    </div>
                </IonButton>
            </div>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </IonAccordion>
    );
};

export default React.memo(PointsComponent);
