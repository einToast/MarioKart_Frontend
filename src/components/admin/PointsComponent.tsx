import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from "react";
import "../../pages/admin/Points.css";
import { GameReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { resolveSwitch } from "../../util/layout/switches";
import { AdminScheduleService } from "../../util/service";
import Toast from "../Toast";

const PointsComponent: React.FC<{ game: GameReturnDTO, roundId: number, isOpen: boolean, toggleAccordion: () => void, switches?: SwitchDTO[] }> = ({ game, switches }) => {
    const pointsOfTeam = (teamId: number) => game.points?.find(point => point.team.id === teamId);

    // One entry per team of the game, in the order of the teams
    const [points, setPoints] = useState<number[]>(() => game.teams.map(team => pointsOfTeam(team.id)?.points ?? 0));

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const gameSwitch = resolveSwitch(switches, game.switchIndex);

    const handleChangePoints = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newValue = Number.parseInt(event.target.value);

        setPoints(previous => previous.map((value, position) => position === index ? newValue : value));

        const teamPoints = pointsOfTeam(game.teams[index].id);
        if (teamPoints) {
            teamPoints.points = newValue;
        }
    };

    const handleSavePoints = () => {
        // AdminScheduleService.saveGame(roundId, game)
        AdminScheduleService.saveGameDirect(game)
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
        <IonAccordion value={game.id.toString()}>
            <IonItem slot="header" color="light">
                <h3 style={{ color: gameSwitch.color }}>Switch {gameSwitch.name}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {game.teams.map((team, index) => (
                        <div className={"characterInput"} key={team.id}>
                            <input
                                type={"number"}
                                value={points[index]}
                                onChange={(e) => handleChangePoints(e, index)}
                            />
                            <img src={`/characters/${team.character.characterName}.png`} alt="Character" />
                        </div>
                    ))}
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
