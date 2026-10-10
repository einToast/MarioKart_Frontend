import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import FloorPlanEditor from "../../components/floorplan/FloorPlanEditor";
import Toast from "../../components/Toast";
import { SwitchDTO } from "../../util/api/config/dto";
import {
    createDefaultFloorPlan,
    FloorPlan,
    isDefaultFloorPlan,
    parseFloorPlan,
    serializeFloorPlan,
    syncSwitchMarkers,
} from "../../util/layout/floorPlan";
import { MAX_SWITCH_NAME_LENGTH, MAX_SWITCHES, suggestSwitch } from "../../util/layout/switches";
import { AdminSettingsService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Venue.css";

const Venue: React.FC = () => {
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);
    const [plan, setPlan] = useState<FloorPlan>(createDefaultFloorPlan(0));
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
        const loadVenue = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            const settings = await PublicSettingsService.getSettings();
            const loadedSwitches = settings.switches ?? [];
            const loadedPlan = parseFloorPlan(settings.floorPlan) ?? createDefaultFloorPlan(loadedSwitches.length);
            setSwitches(loadedSwitches);
            setPlan(syncSwitchMarkers(loadedPlan, loadedSwitches.length));
        };

        loadVenue().catch(error => showError(error.message));
    }, [location]);

    // Games refer to switches by their position, so only the last switch can be removed
    const changeSwitches = (changed: SwitchDTO[]) => {
        setSwitches(changed);
        // An untouched default plan follows the number of switches, an edited one only gets its markers adjusted
        setPlan(current => isDefaultFloorPlan(current, switches.length)
            ? createDefaultFloorPlan(changed.length)
            : syncSwitchMarkers(current, changed.length));
    };

    const handleSwitchChange = (index: number, changes: Partial<SwitchDTO>) => {
        setSwitches(current => current.map((existing, position) => position === index ? { ...existing, ...changes } : existing));
    };

    const handleSave = () => {
        const trimmed = switches.map(existing => ({ ...existing, name: existing.name.trim() }));
        if (trimmed.some(existing => existing.name === '')) {
            showError('Jede Switch braucht einen Namen');
            return;
        }

        setButtonDisabled(true);
        AdminSettingsService.updateVenue(trimmed, plan.elements.length > 0 ? serializeFloorPlan(plan) : '')
            .then(() => {
                setSwitches(trimmed);
                setError('Switches und Raumplan gespeichert');
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
                        Switches & Raumplan
                    </LinearGradient>
                </h2>

                <h3>Switches</h3>
                <p>Die Spiele einer Runde werden der Reihe nach auf die Switches verteilt. Das Finale findet an der ersten Switch statt.</p>
                <div className="switchList">
                    {switches.map((existing, index) => (
                        // The position is the identity of a switch
                        <div className="switchRow" key={index}>
                            <span className="switchNumber" style={{ backgroundColor: existing.color }}>{index + 1}</span>
                            <input
                                type="text"
                                aria-label={`Name der Switch ${index + 1}`}
                                maxLength={MAX_SWITCH_NAME_LENGTH}
                                value={existing.name}
                                onChange={(e) => handleSwitchChange(index, { name: e.target.value })}
                            />
                            <input
                                type="color"
                                aria-label={`Farbe der Switch ${index + 1}`}
                                value={existing.color}
                                onChange={(e) => handleSwitchChange(index, { color: e.target.value })}
                            />
                            {index === switches.length - 1 && (
                                <button type="button" onClick={() => changeSwitches(switches.slice(0, -1))}>Entfernen</button>
                            )}
                        </div>
                    ))}
                    {switches.length === 0 && <p>Noch keine Switches eingerichtet. Bis dahin werden sie durchnummeriert.</p>}
                    <button
                        type="button"
                        disabled={switches.length >= MAX_SWITCHES}
                        onClick={() => changeSwitches([...switches, suggestSwitch(switches)])}
                    >
                        + Switch hinzufügen
                    </button>
                </div>

                <h3>Raumplan</h3>
                <FloorPlanEditor plan={plan} switches={switches} onChange={setPlan} />
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

export default Venue;
