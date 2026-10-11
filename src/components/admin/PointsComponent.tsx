import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useRef, useState } from "react";
import "../../pages/admin/Points.css";
import { GameReturnDTO, SwitchDTO } from "../../util/api/config/dto";
import { resolveSwitch } from "../../util/layout/switches";
import { AdminOcrService, AdminScheduleService } from "../../util/service";
import { GamePhoto } from "../../util/service/ocr/admin/AdminOcrPhotoService";
import Toast from "../Toast";
import ZoomablePhoto from "./ZoomablePhoto";

const PointsComponent: React.FC<{ game: GameReturnDTO, roundId: number, isOpen: boolean, toggleAccordion: () => void, switches?: SwitchDTO[], ocrProvider?: string }> = ({ game, roundId, switches, ocrProvider }) => {
    const pointsOfTeam = (teamId: number) => game.points?.find(point => point.team.id === teamId);

    // One entry per team of the game, in the order of the teams
    const [points, setPoints] = useState<number[]>(() => game.teams.map(team => pointsOfTeam(team.id)?.points ?? 0));

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const [detecting, setDetecting] = useState<boolean>(false);
    const [photo, setPhoto] = useState<GamePhoto | undefined>(() => AdminOcrService.getGamePhoto(game.id));

    const gameSwitch = resolveSwitch(switches, game.switchIndex);

    const changePoints = (index: number, newValue: number) => {
        setPoints(previous => previous.map((value, position) => position === index ? newValue : value));

        const teamPoints = pointsOfTeam(game.teams[index].id);
        if (teamPoints) {
            teamPoints.points = newValue;
        }
    };

    const handleChangePoints = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        changePoints(index, Number.parseInt(event.target.value));
    };

    // The photo is only shown, it is evaluated with a second click
    const handleChoosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Otherwise choosing the same photo again would not trigger a change
        event.target.value = '';
        if (file) {
            setPhoto(AdminOcrService.setGamePhoto(game.id, file));
        }
    };

    // The detected points are only entered, they are saved like points typed in by hand
    const handleDetectPoints = () => {
        if (!photo || !ocrProvider) {
            return;
        }

        setDetecting(true);
        AdminOcrService.detectCharacters(roundId, game.id, ocrProvider, photo.file)
            .then(characters => {
                let detected = 0;
                game.teams.forEach((team, index) => {
                    const character = characters.find(candidate => candidate.name === team.character.characterName);
                    if (character) {
                        changePoints(index, character.points);
                        detected++;
                    }
                });

                // Several photos can be evaluated at once, so the message names its game
                if (detected === game.teams.length) {
                    setError(`Switch ${gameSwitch.name}: Punkte erkannt, bitte prüfen und speichern`);
                    setIsError(false);
                } else {
                    setError(`Switch ${gameSwitch.name}: ${detected === 0 ? 'Auf dem Foto wurden keine Punkte erkannt' : 'Nicht alle Charaktere wurden erkannt'}`);
                    setIsError(true);
                }
            })
            .catch(error => {
                setError(`Switch ${gameSwitch.name}: ${error.message}`);
                setIsError(true);
            })
            .finally(() => {
                setDetecting(false);
                setShowToast(true);
            });
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
                <div className={photo ? "pointsComparison" : undefined}>
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
                    {/* The key shows another photo unzoomed */}
                    {photo && <ZoomablePhoto key={photo.url} src={photo.url} alt={`Ergebnis von Switch ${gameSwitch.name}`} />}
                </div>
                {ocrProvider && (
                    <>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            aria-label={`Foto von Switch ${gameSwitch.name}`}
                            ref={photoInputRef}
                            onChange={handleChoosePhoto}
                            hidden
                        />
                        <IonButton slot="start" shape="round" className={"secondary"} disabled={detecting} onClick={() => photoInputRef.current?.click()}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    photoInputRef.current?.click();
                                }
                            }}
                        >
                            <div>
                                <p>{photo ? 'Anderes Foto auswählen' : 'Foto auswählen'}</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                        {photo && (
                            <IonButton slot="start" shape="round" className={"secondary"} disabled={detecting} onClick={handleDetectPoints}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleDetectPoints();
                                    }
                                }}
                            >
                                <div>
                                    <p>{detecting ? 'Foto wird ausgewertet...' : 'Foto auswerten'}</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        )}
                    </>
                )}
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
