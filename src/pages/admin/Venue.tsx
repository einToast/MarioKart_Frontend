import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import FloorPlanEditor from "../../components/floorplan/FloorPlanEditor";
import Toast from "../../components/Toast";
import { SwitchDTO, SwitchTranslation } from "../../util/api/config/dto";
import {
    createDefaultFloorPlan,
    isDefaultFloorPlan,
    parseFloorPlan,
    serializeFloorPlan,
    syncSwitchMarkers,
} from "../../util/layout/floorPlan";
import { MAX_SWITCH_NAME_LENGTH, MAX_SWITCHES, suggestSwitch, toSwitchRow } from "../../util/layout/switches";
import { AdminSettingsService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Venue.css";
import { FloorPlan, SwitchRow } from "../../util/api/config/interfaces";
import { useTranslation } from 'react-i18next';
import TranslationLanguageTabs from "../../components/admin/TranslationLanguageTabs";
import { DEFAULT_LANGUAGE, Language } from "../../i18n/languages";
import { pruneTranslations, translatedChange, translatedValue } from "../../i18n/translatable";

const Venue: React.FC = () => {
    const { t } = useTranslation();
    const [rows, setRows] = useState<SwitchRow[]>([]);
    const switches = useMemo(() => rows.map(row => row.gameSwitch), [rows]);
    const [plan, setPlan] = useState<FloorPlan>(createDefaultFloorPlan(0));
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [editLanguage, setEditLanguage] = useState<Language>(DEFAULT_LANGUAGE);

    const [error, setError] = useState<string>('');
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
            setRows(loadedSwitches.map(toSwitchRow));
            setPlan(syncSwitchMarkers(loadedPlan, loadedSwitches.length));
        };

        loadVenue().catch(error => showError(error.message));
    }, [location]);

    // Games refer to switches by their position, so only the last switch can be removed
    const changeSwitches = (changed: SwitchRow[]) => {
        setRows(changed);
        // An untouched default plan follows the number of switches, an edited one only gets its markers adjusted
        setPlan(current => isDefaultFloorPlan(current, switches.length)
            ? createDefaultFloorPlan(changed.length)
            : syncSwitchMarkers(current, changed.length));
    };

    const handleSwitchChange = (index: number, changes: Partial<SwitchDTO>) => {
        setRows(current => current.map((row, position) => position === index ? { ...row, gameSwitch: { ...row.gameSwitch, ...changes } } : row));
    };

    const handleSave = () => {
        const trimmed = switches.map(existing => ({ ...existing, name: existing.name.trim(), translations: pruneTranslations(existing.translations) }));
        if (trimmed.some(existing => existing.name === '')) {
            showError(t('admin.venue.nameRequired'));
            return;
        }

        setButtonDisabled(true);
        AdminSettingsService.updateVenue(trimmed, plan.elements.length > 0 ? serializeFloorPlan(plan) : '')
            .then(() => {
                setRows(rows.map((row, position) => ({ ...row, gameSwitch: trimmed[position] })));
                setError(t('admin.venue.saved'));
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
                        {t('admin.venue.title')}
                    </LinearGradient>
                </h2>
                <TranslationLanguageTabs value={editLanguage} onChange={setEditLanguage} />

                <h3>{t('admin.venue.switches')}</h3>
                <p>{t('admin.venue.description')}</p>
                <div className="switchList">
                    {rows.map(({ key, gameSwitch: existing }, index) => (
                        <div className="switchRow" key={key}>
                            <span className="switchNumber" style={{ backgroundColor: existing.color }}>{index + 1}</span>
                            <input
                                type="text"
                                aria-label={t('admin.venue.nameOf', { number: index + 1 })}
                                maxLength={MAX_SWITCH_NAME_LENGTH}
                                placeholder={editLanguage === DEFAULT_LANGUAGE ? undefined : existing.name}
                                value={translatedValue<SwitchTranslation, 'name'>(existing, 'name', editLanguage) ?? ''}
                                onChange={(e) => handleSwitchChange(index, translatedChange<SwitchTranslation, 'name'>(existing, 'name', editLanguage, e.target.value))}
                            />
                            <input
                                type="color"
                                aria-label={t('admin.venue.colorOf', { number: index + 1 })}
                                value={existing.color}
                                onChange={(e) => handleSwitchChange(index, { color: e.target.value })}
                            />
                            {index === switches.length - 1 && (
                                <button type="button" onClick={() => changeSwitches(rows.slice(0, -1))}>{t('common.remove')}</button>
                            )}
                        </div>
                    ))}
                    {switches.length === 0 && <p>{t('admin.venue.empty')}</p>}
                    <button
                        type="button"
                        disabled={switches.length >= MAX_SWITCHES}
                        onClick={() => changeSwitches([...rows, toSwitchRow(suggestSwitch(switches))])}
                    >
                        {t('admin.venue.add')}
                    </button>
                </div>

                <h3>{t('admin.venue.floorPlan')}</h3>
                <FloorPlanEditor plan={plan} switches={switches} language={editLanguage} onChange={setPlan} />
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
                            <p>{t('common.save')}</p>
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
