import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import Toast from "../../components/Toast";
import {
    DEFAULT_PROGRAM_ICON,
    defaultProgram,
    MAX_PROGRAM_ENTRIES,
    MAX_PROGRAM_TEXT_LENGTH,
    MAX_PROGRAM_TIME_LENGTH,
    PROGRAM_ICONS,
    ProgramEntry,
    ProgramIcon,
    resolveProgram,
    serializeProgram,
} from "../../util/layout/program";
import { AdminSettingsService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Program.css";

const Program: React.FC = () => {
    const [entries, setEntries] = useState<ProgramEntry[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [error, setError] = useState<string>('Error');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const showError = (message: string) => {
        setError(message);
        setIsError(true);
        setShowToast(true);
    };

    useEffect(() => {
        const loadProgram = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            const settings = await PublicSettingsService.getSettings();
            setEntries(resolveProgram(settings.program));
        };

        loadProgram().catch(error => showError(error.message));
    }, [location]);

    const handleChange = (index: number, changes: Partial<ProgramEntry>) => {
        setEntries(current => current.map((entry, position) => position === index ? { ...entry, ...changes } : entry));
    };

    const handleMove = (index: number, offset: number) => {
        setEntries(current => {
            const moved = [...current];
            [moved[index], moved[index + offset]] = [moved[index + offset], moved[index]];
            return moved;
        });
    };

    const handleSave = () => {
        const trimmed = entries.map(entry => ({ ...entry, time: entry.time.trim(), text: entry.text.trim() }));
        if (trimmed.some(entry => entry.text === '')) {
            showError('Jeder Programmpunkt braucht einen Text');
            return;
        }

        setButtonDisabled(true);
        AdminSettingsService.updateProgram(serializeProgram(trimmed))
            .then(() => {
                setEntries(trimmed);
                setError('Programm gespeichert');
                setIsError(false);
                setShowToast(true);
            })
            .catch(error => showError(error.message))
            .finally(() => setButtonDisabled(false));
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Programm
                    </LinearGradient>
                </h2>
                <p>Das Programm steht bei den Teams unter Details. Ohne Programmpunkte wird es dort ausgeblendet.</p>

                <div className="programList">
                    {entries.map((entry, index) => (
                        // The position is the identity of an entry
                        <div className="programRow" key={index}>
                            <IonIcon aria-hidden="true" icon={PROGRAM_ICONS[entry.icon].icon} />
                            <select
                                aria-label={`Symbol von Programmpunkt ${index + 1}`}
                                value={entry.icon}
                                onChange={(e) => handleChange(index, { icon: e.target.value as ProgramIcon })}
                            >
                                {Object.entries(PROGRAM_ICONS).map(([key, { label }]) => (
                                    <option value={key} key={key}>{label}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                className="programTime"
                                aria-label={`Zeit von Programmpunkt ${index + 1}`}
                                placeholder="16:00 - 16:45"
                                maxLength={MAX_PROGRAM_TIME_LENGTH}
                                value={entry.time}
                                onChange={(e) => handleChange(index, { time: e.target.value })}
                            />
                            <input
                                type="text"
                                className="programText"
                                aria-label={`Text von Programmpunkt ${index + 1}`}
                                maxLength={MAX_PROGRAM_TEXT_LENGTH}
                                value={entry.text}
                                onChange={(e) => handleChange(index, { text: e.target.value })}
                            />
                            <button type="button" aria-label={`Programmpunkt ${index + 1} nach oben`} disabled={index === 0} onClick={() => handleMove(index, -1)}>↑</button>
                            <button type="button" aria-label={`Programmpunkt ${index + 1} nach unten`} disabled={index === entries.length - 1} onClick={() => handleMove(index, 1)}>↓</button>
                            <button type="button" aria-label={`Programmpunkt ${index + 1} entfernen`} onClick={() => setEntries(entries.filter((_, position) => position !== index))}>✕</button>
                        </div>
                    ))}
                    {entries.length === 0 && <p>Keine Programmpunkte.</p>}
                    <div className="programActions">
                        <button
                            type="button"
                            disabled={entries.length >= MAX_PROGRAM_ENTRIES}
                            onClick={() => setEntries([...entries, { icon: DEFAULT_PROGRAM_ICON, time: '', text: '' }])}
                        >
                            + Programmpunkt hinzufügen
                        </button>
                        <button type="button" onClick={() => setEntries(defaultProgram())}>Standard-Programm</button>
                    </div>
                </div>
                <div style={{ marginBottom: '115px' }}></div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round"} disabled={buttonDisabled} onClick={handleSave}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSave();
                            }
                        }}
                    >
                        <div>
                            <p>Speichern</p>
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

export default Program;
