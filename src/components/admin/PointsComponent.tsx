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
import Toast from "../Toast";
import ZoomablePhoto from "./ZoomablePhoto";
import { GamePhoto } from "../../util/api/config/interfaces";
import { useTranslation } from 'react-i18next';

const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const PointsComponent: React.FC<{ game: GameReturnDTO, roundId: number, isOpen: boolean, toggleAccordion: () => void, switches?: SwitchDTO[], ocrProvider?: string }> = ({ game, roundId, isOpen, toggleAccordion, switches, ocrProvider }) => {
    const { t } = useTranslation();
    const pointsOfTeam = (teamId: number) => game.points?.find(point => point.team.id === teamId);

    const [points, setPoints] = useState<(number | '')[]>(() => game.teams.map(team => pointsOfTeam(team.id)?.points ?? 0));

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const [detecting, setDetecting] = useState<boolean>(false);
    const [photo, setPhoto] = useState<GamePhoto | undefined>(() => AdminOcrService.getGamePhoto(game.id));
    const [dropTarget, setDropTarget] = useState<boolean>(false);

    const gameSwitch = resolveSwitch(switches, game.switchIndex);

    const changePoints = (index: number, newValue: number | '') => {
        setPoints(previous => previous.map((value, position) => position === index ? newValue : value));

        const teamPoints = pointsOfTeam(game.teams[index].id);
        if (teamPoints) {
            teamPoints.points = newValue === '' ? 0 : newValue;
        }
    };

    const handleChangePoints = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const parsed = Number.parseInt(event.target.value);
        changePoints(index, Number.isNaN(parsed) ? '' : parsed);
    };

    const handleChoosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) {
            setPhoto(AdminOcrService.setGamePhoto(game.id, file));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes('Files')) {
            return;
        }
        event.preventDefault();
        setDropTarget(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropTarget(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes('Files')) {
            return;
        }
        event.preventDefault();
        setDropTarget(false);

        const file = Array.from(event.dataTransfer.files).find(candidate => PHOTO_TYPES.includes(candidate.type));
        if (!file) {
            setError(t('admin.points.unsupportedPhoto', { name: gameSwitch.name }));
            setIsError(true);
            setShowToast(true);
            return;
        }

        setPhoto(AdminOcrService.setGamePhoto(game.id, file));
        if (!isOpen) {
            toggleAccordion();
        }
    };

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
                    setError(t('admin.points.pointsDetected', { name: gameSwitch.name }));
                    setIsError(false);
                } else {
                    setError(t(detected === 0 ? 'admin.points.noPointsDetected' : 'admin.points.notAllDetected', { name: gameSwitch.name }));
                    setIsError(true);
                }
            })
            .catch(error => {
                setError(t('admin.points.switchError', { name: gameSwitch.name, message: error.message }));
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
                    setError(t('admin.points.gameSaved'));
                    setIsError(false);
                } else {
                    setError(t('admin.points.gameNotSaved'));
                    setIsError(true);
                }
            })
            .catch(error => {
                setError(t('admin.points.saveError', { message: error.message }));
                setIsError(true);
            })
            .finally(() => {
                setShowToast(true);
            });
    }

    return (
        <IonAccordion
            value={game.id.toString()}
            className={dropTarget ? "photoDropTarget" : undefined}
            {...(ocrProvider ? { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop } : {})}
        >
            <IonItem slot="header" color="light">
                <h3 style={{ color: gameSwitch.color }}>{t('schedule.switchName', { name: gameSwitch.name })}</h3>
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
                                <img src={`/characters/${team.character.characterName}.webp`} alt={team.character.characterName} />
                            </div>
                        ))}
                    </div>
                    {photo && <ZoomablePhoto key={photo.url} src={photo.url} alt={t('admin.points.resultPhoto', { name: gameSwitch.name })} />}
                </div>
                {ocrProvider && (
                    <>
                        <input
                            type="file"
                            accept={PHOTO_TYPES.join(',')}
                            aria-label={t('admin.points.photoOf', { name: gameSwitch.name })}
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
                                <p>{photo ? t('admin.points.chooseOtherPhoto') : t('admin.points.choosePhoto')}</p>
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
                                    <p>{detecting ? t('admin.points.detecting') : t('admin.points.detect')}</p>
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
                        <p>{t('admin.points.saveGame')}</p>
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
