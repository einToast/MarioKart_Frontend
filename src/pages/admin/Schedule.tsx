import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminScheduleService, PublicCookiesService, PublicRegistrationService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Schedule.css";

const LEGACY_VERSION = 1;
const MAX_SWITCH_COUNT = 16;
const MIN_TEAMS_PER_GAME = 2;
const MAX_TEAMS_PER_GAME = 8;

const isBetween = (value: number | '', min: number, max: number): value is number =>
    value !== '' && Number.isInteger(value) && value >= min && value <= max;

const Schedule: React.FC = () => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);

    const [error, setError] = useState<string>('Error');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const [version, setVersion] = useState<number>(3);
    const [switchCount, setSwitchCount] = useState<number | ''>(4);
    const [teamsPerGame, setTeamsPerGame] = useState<number | ''>(4);
    const [roundCount, setRoundCount] = useState<number | ''>(8);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadTeams = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            const teamNames = PublicRegistrationService.getTeamsSortedByTeamName();
            teamNames.then((response) => {
                setTeams(response);
            }).catch((error) => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
        };

        loadTeams().catch(error => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    // A team plays on one switch per round, so every switch needs its own teams
    const teamsNeeded = switchCount !== '' && teamsPerGame !== '' ? switchCount * teamsPerGame : null;

    const validateParameters = (): string | null => {
        if (version === LEGACY_VERSION) {
            return null;
        }
        if (!isBetween(switchCount, 1, MAX_SWITCH_COUNT)) {
            return `Die Anzahl der Spielfelder muss zwischen 1 und ${MAX_SWITCH_COUNT} liegen`;
        }
        if (!isBetween(roundCount, 1, Number.MAX_SAFE_INTEGER)) {
            return 'Es muss mindestens eine Runde geben';
        }
        if (!isBetween(teamsPerGame, MIN_TEAMS_PER_GAME, MAX_TEAMS_PER_GAME)) {
            return `Pro Spiel können ${MIN_TEAMS_PER_GAME} bis ${MAX_TEAMS_PER_GAME} Teams antreten`;
        }
        return null;
    };

    const handleScheduleCreation = () => {
        const invalid = validateParameters();
        if (invalid) {
            setError(invalid);
            setIsError(true);
            setShowToast(true);
            return;
        }

        setButtonDisabled(true);
        AdminScheduleService.createSchedule(version, switchCount as number, roundCount as number, teamsPerGame as number)
            .then(newRounds => {
                if (newRounds) {
                    setError('Spielplan erfolgreich erstellt');
                    setIsError(false);
                    setShowToast(true);
                    navigate('/admin/dashboard');
                } else {
                    setError('Spielplan konnte nicht erstellt werden');
                    setIsError(true);
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            })
            .finally(() => {
                setButtonDisabled(false);
            });
    };

    const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVersion = Number.parseInt(event.target.value);
        setVersion(selectedVersion);
        if (selectedVersion === LEGACY_VERSION) {
            setSwitchCount(4);
            setTeamsPerGame(4);
            setRoundCount(8);
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Spielplan erstellen
                    </LinearGradient>
                </h2>
                <h3>
                    Anzahl der angemeldeten Teams: {teams.length}
                </h3>

                <div className={"flexContainer"} style={{ paddingBottom: "50px" }}>
                    {teams ? (
                        <TeamAdminContainer
                            teams={teams}
                            scheduleCreated={false}
                            finalScheduleCreated={false}
                            setModalClosed={setModalClosed}
                            modalClosed={modalClosed}
                            getTeams={PublicRegistrationService.getTeamsSortedByTeamName}
                        />

                    ) : (
                        <p>loading...</p>
                    )}
                </div>

                <div className={"playedContainer scheduleControls"}>
                    <div className="scheduleFields">
                        <div className="scheduleField">
                            <label htmlFor="scheduleVersion">Schedule Version:</label>
                            <select id="scheduleVersion"
                                value={version}
                                onChange={handleVersionChange}
                            >
                                <option value="1">v1</option>
                                <option value="2">v2</option>
                                <option value="3">v3</option>
                            </select>
                        </div>

                        <div className="scheduleField">
                            <label htmlFor="switchCount">Anzahl Spielfelder:</label>
                            <input id="switchCount"
                                type="number"
                                min={1}
                                max={MAX_SWITCH_COUNT}
                                value={switchCount}
                                onChange={(e) => setSwitchCount(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={version === LEGACY_VERSION}
                            />
                        </div>
                        <div className="scheduleField">
                            <label htmlFor="roundCount">Anzahl Runden:</label>
                            <input id="roundCount"
                                type="number"
                                min={1}
                                value={roundCount}
                                onChange={(e) => setRoundCount(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={version === LEGACY_VERSION}
                            />
                        </div>
                        <div className="scheduleField">
                            <label htmlFor="teamsPerGame">Teams pro Spiel:</label>
                            <input id="teamsPerGame"
                                type="number"
                                min={MIN_TEAMS_PER_GAME}
                                max={MAX_TEAMS_PER_GAME}
                                value={teamsPerGame}
                                onChange={(e) => setTeamsPerGame(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={version === LEGACY_VERSION}
                            />
                        </div>
                    </div>
                    {version !== LEGACY_VERSION && teamsNeeded !== null && (
                        <p className="scheduleHint">Mindestens {teamsNeeded} Teams nötig</p>
                    )}
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled}>
                        <div onClick={handleScheduleCreation}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleScheduleCreation();
                                }
                            }}
                        >
                            <p>Spielplan erzeugen</p>
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
    )
        ;
};

export default Schedule;
