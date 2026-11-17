import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import TeamAdminContainer from "../../components/admin/TeamAdminContainer";
import Toast from "../../components/Toast";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { AdminRegistrationService, AdminScheduleService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Schedule.css";
import { useTranslation } from 'react-i18next';

const LEGACY_VERSION = 1;
const PER_FIELD_VERSION = 4;
const MAX_SWITCH_COUNT = 16;
const MIN_TEAMS_PER_GAME = 2;
const MAX_TEAMS_PER_GAME = 8;
const DEFAULT_SWITCH_COUNT = 4;
const DEFAULT_BREAK_ROUND = 6;
const DEFAULT_BREAK_MINUTES = 30;

const isBetween = (value: number | '', min: number, max: number): value is number =>
    value !== '' && Number.isInteger(value) && value >= min && value <= max;

const Schedule: React.FC = () => {
    const { t } = useTranslation();
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [modalClosed, setModalClosed] = useState(false);

    const [error, setError] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const [version, setVersion] = useState<number>(2);
    const [switchCount, setSwitchCount] = useState<number | ''>(DEFAULT_SWITCH_COUNT);
    const [teamsPerGame, setTeamsPerGame] = useState<number | ''>(4);
    const [teamsPerField, setTeamsPerField] = useState<(number | '')[]>([]);
    const [roundCount, setRoundCount] = useState<number | ''>(8);
    const switchCountEdited = useRef(false);
    const [breakRound, setBreakRound] = useState<number | ''>(DEFAULT_BREAK_ROUND);
    const [breakMinutes, setBreakMinutes] = useState<number | ''>(DEFAULT_BREAK_MINUTES);

    const navigate = useNavigate();
    const location = useLocation();

    const getTeams = () => {
        AdminRegistrationService.getTeamsSortedByFinalPoints()
            .then((response) => {
                setTeams([...response].sort((a, b) => a.teamName.localeCompare(b.teamName)));
            })
            .catch((error) => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    };

    useEffect(() => {
        const loadTeams = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            getTeams();
            const switches = await PublicSettingsService.getSwitches();
            if (switches.length > 0 && !switchCountEdited.current) {
                setSwitchCount(Math.min(switches.length, MAX_SWITCH_COUNT));
            }
        };

        loadTeams().catch(error => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    const perField = version >= PER_FIELD_VERSION;
    // A switch has the common number of teams until it gets its own
    const fieldSizes: (number | '')[] = Array.from(
        { length: isBetween(switchCount, 1, MAX_SWITCH_COUNT) ? switchCount : 0 },
        (_, index) => teamsPerField[index] ?? teamsPerGame);

    // A team plays on one switch per round, so every switch needs its own teams
    const teamsNeeded = (() => {
        if (!perField) {
            return switchCount !== '' && teamsPerGame !== '' ? switchCount * teamsPerGame : null;
        }
        if (fieldSizes.length === 0 || fieldSizes.includes('')) {
            return null;
        }
        return fieldSizes.reduce<number>((sum, size) => sum + Number(size), 0);
    })();

    const validateParameters = (): string | null => {
        if (!isBetween(breakRound, 1, Number.MAX_SAFE_INTEGER) || !isBetween(breakMinutes, 1, Number.MAX_SAFE_INTEGER)) {
            return t('admin.schedule.invalidBreak');
        }
        if (version === LEGACY_VERSION) {
            return null;
        }
        if (!isBetween(switchCount, 1, MAX_SWITCH_COUNT)) {
            return t('admin.schedule.invalidFieldCount', { max: MAX_SWITCH_COUNT });
        }
        if (!isBetween(roundCount, 1, Number.MAX_SAFE_INTEGER)) {
            return t('admin.schedule.invalidRoundCount');
        }
        const sizes = perField ? fieldSizes : [teamsPerGame];
        if (!sizes.every(size => isBetween(size, MIN_TEAMS_PER_GAME, MAX_TEAMS_PER_GAME))) {
            return t('admin.schedule.invalidTeamsPerGame', { min: MIN_TEAMS_PER_GAME, max: MAX_TEAMS_PER_GAME });
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
        const creation = AdminScheduleService.createSchedule(version, switchCount as number, roundCount as number,
            (perField ? fieldSizes[0] : teamsPerGame) as number, perField ? fieldSizes as number[] : undefined,
            breakRound as number, breakMinutes as number);
        creation
            .then(newRounds => {
                if (newRounds) {
                    setError(t('admin.schedule.created'));
                    setIsError(false);
                    setShowToast(true);
                    navigate('/admin/dashboard');
                } else {
                    setError(t('errors.scheduleNotCreated'));
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
            switchCountEdited.current = true;
            setSwitchCount(DEFAULT_SWITCH_COUNT);
            setTeamsPerGame(4);
            setTeamsPerField([]);
            setRoundCount(8);
        }
    }

    const handleTeamsPerFieldChange = (index: number, value: string) => {
        const sizes = [...fieldSizes];
        sizes[index] = value === '' ? '' : Number(value);
        setTeamsPerField(sizes);
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        {t('admin.schedule.title')}
                    </LinearGradient>
                </h2>
                <h3>
                    {t('admin.teams.registeredCount', { count: teams.length })}
                </h3>

                <div className={"flexContainer"} style={{ paddingBottom: "50px" }}>
                    {teams ? (
                        <TeamAdminContainer
                            teams={teams}
                            scheduleCreated={false}
                            finalScheduleCreated={false}
                            setModalClosed={setModalClosed}
                            modalClosed={modalClosed}
                            getTeams={getTeams}
                        />

                    ) : (
                        <p>{t('common.loading')}</p>
                    )}
                </div>

                <div className={"playedContainer scheduleControls"}>
                    <div className="scheduleFields">
                        <div className="scheduleField">
                            <label htmlFor="scheduleVersion">{t('admin.schedule.version')}</label>
                            <select id="scheduleVersion"
                                value={version}
                                onChange={handleVersionChange}
                            >
                                <option value="2">v2</option>
                                <option value="5">v5</option>
                            </select>
                        </div>

                        <div className="scheduleField">
                            <label htmlFor="switchCount">{t('admin.schedule.fieldCount')}</label>
                            <input id="switchCount"
                                type="number"
                                min={1}
                                max={MAX_SWITCH_COUNT}
                                value={switchCount}
                                onChange={(e) => {
                                    switchCountEdited.current = true;
                                    setSwitchCount(e.target.value === '' ? '' : Number(e.target.value));
                                }}
                                disabled={version === LEGACY_VERSION}
                            />
                        </div>
                        <div className="scheduleField">
                            <label htmlFor="roundCount">{t('admin.schedule.roundCount')}</label>
                            <input id="roundCount"
                                type="number"
                                min={1}
                                value={roundCount}
                                onChange={(e) => setRoundCount(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={version === LEGACY_VERSION}
                            />
                        </div>
                        <div className="scheduleField">
                            <label htmlFor="breakRound">{t('admin.schedule.breakRound')}</label>
                            <input id="breakRound"
                                type="number"
                                min={1}
                                value={breakRound}
                                onChange={(e) => setBreakRound(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                        <div className="scheduleField">
                            <label htmlFor="breakMinutes">{t('admin.schedule.breakMinutes')}</label>
                            <input id="breakMinutes"
                                type="number"
                                min={1}
                                value={breakMinutes}
                                onChange={(e) => setBreakMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                        {!perField && (
                            <div className="scheduleField">
                                <label htmlFor="teamsPerGame">{t('admin.schedule.teamsPerGame')}</label>
                                <input id="teamsPerGame"
                                    type="number"
                                    min={MIN_TEAMS_PER_GAME}
                                    max={MAX_TEAMS_PER_GAME}
                                    value={teamsPerGame}
                                    onChange={(e) => setTeamsPerGame(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={version === LEGACY_VERSION}
                                />
                            </div>
                        )}
                    </div>
                    {perField && (
                        <div className="scheduleFields">
                            {fieldSizes.map((size, index) => (
                                <div className="scheduleField" key={`teamsPerField${index + 1}`}>
                                    <label htmlFor={`teamsPerField${index + 1}`}>{t('admin.schedule.teamsPerField', { number: index + 1 })}</label>
                                    <input id={`teamsPerField${index + 1}`}
                                        type="number"
                                        min={MIN_TEAMS_PER_GAME}
                                        max={MAX_TEAMS_PER_GAME}
                                        value={size}
                                        onChange={(e) => handleTeamsPerFieldChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {version !== LEGACY_VERSION && teamsNeeded !== null && (
                        <p className="scheduleHint">{t('admin.schedule.teamsNeeded', { count: teamsNeeded })}</p>
                    )}
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled} onClick={handleScheduleCreation}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleScheduleCreation();
                            }
                        }}
                    >
                        <div>
                            <p>{t('admin.dashboard.schedule')}</p>
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
