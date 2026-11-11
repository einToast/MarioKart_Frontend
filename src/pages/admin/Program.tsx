import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import Toast from "../../components/Toast";
import { ProgramEntry, ProgramRow, TextTranslation } from "../../util/api/config/interfaces";
import {
    DEFAULT_PROGRAM_ICON,
    defaultProgram,
    MAX_PROGRAM_ENTRIES,
    MAX_PROGRAM_TEXT_LENGTH,
    MAX_PROGRAM_TIME_LENGTH,
    PROGRAM_ICONS,
    ProgramIcon,
    resolveProgram,
    serializeProgram,
    toProgramRow,
} from "../../util/layout/program";
import { AdminSettingsService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Program.css";
import { useTranslation } from 'react-i18next';
import TranslationLanguageTabs from "../../components/admin/TranslationLanguageTabs";
import { DEFAULT_LANGUAGE, Language } from "../../i18n/languages";
import { translatedChange, translatedValue } from "../../i18n/translatable";

const Program: React.FC = () => {
    const { t } = useTranslation();
    const [rows, setRows] = useState<ProgramRow[]>([]);
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
        const loadProgram = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            const settings = await PublicSettingsService.getSettings();
            setRows(resolveProgram(settings.program).map(toProgramRow));
        };

        loadProgram().catch(error => showError(error.message));
    }, [location]);

    const handleChange = (index: number, changes: Partial<ProgramEntry>) => {
        setRows(current => current.map((row, position) => position === index ? { ...row, entry: { ...row.entry, ...changes } } : row));
    };

    const handleMove = (index: number, offset: number) => {
        setRows(current => {
            const moved = [...current];
            [moved[index], moved[index + offset]] = [moved[index + offset], moved[index]];
            return moved;
        });
    };

    const handleSave = () => {
        const trimmed = rows.map(({ entry }) => ({ ...entry, time: entry.time.trim(), text: entry.text.trim() }));
        if (trimmed.some(entry => entry.text === '')) {
            showError(t('admin.program.textRequired'));
            return;
        }

        setButtonDisabled(true);
        AdminSettingsService.updateProgram(serializeProgram(trimmed))
            .then(() => {
                setRows(rows.map((row, position) => ({ ...row, entry: trimmed[position] })));
                setError(t('admin.program.saved'));
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
                        {t('admin.program.title')}
                    </LinearGradient>
                </h2>
                <p>{t('admin.program.description')}</p>
                <TranslationLanguageTabs value={editLanguage} onChange={setEditLanguage} />

                <div className="programList">
                    {rows.map(({ key: rowKey, entry }, index) => (
                        <div className="programRow" key={rowKey}>
                            <IonIcon aria-hidden="true" icon={PROGRAM_ICONS[entry.icon].icon} />
                            <select
                                aria-label={t('admin.program.iconOf', { number: index + 1 })}
                                value={entry.icon}
                                onChange={(e) => handleChange(index, { icon: e.target.value as ProgramIcon })}
                            >
                                {(Object.keys(PROGRAM_ICONS) as ProgramIcon[]).map(key => (
                                    <option value={key} key={key}>{t(`admin.program.icons.${key}`)}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                className="programTime"
                                aria-label={t('admin.program.timeOf', { number: index + 1 })}
                                placeholder="16:00 - 16:45"
                                maxLength={MAX_PROGRAM_TIME_LENGTH}
                                value={entry.time}
                                onChange={(e) => handleChange(index, { time: e.target.value })}
                            />
                            <input
                                type="text"
                                className="programText"
                                aria-label={t('admin.program.textOf', { number: index + 1 })}
                                maxLength={MAX_PROGRAM_TEXT_LENGTH}
                                placeholder={editLanguage === DEFAULT_LANGUAGE ? undefined : entry.text}
                                value={translatedValue<TextTranslation, 'text'>(entry, 'text', editLanguage) ?? ''}
                                onChange={(e) => handleChange(index, translatedChange<TextTranslation, 'text'>(entry, 'text', editLanguage, e.target.value))}
                            />
                            <button type="button" aria-label={t('admin.program.moveUp', { number: index + 1 })} disabled={index === 0} onClick={() => handleMove(index, -1)}>↑</button>
                            <button type="button" aria-label={t('admin.program.moveDown', { number: index + 1 })} disabled={index === rows.length - 1} onClick={() => handleMove(index, 1)}>↓</button>
                            <button type="button" aria-label={t('admin.program.remove', { number: index + 1 })} onClick={() => setRows(rows.filter((_, position) => position !== index))}>✕</button>
                        </div>
                    ))}
                    {rows.length === 0 && <p>{t('admin.program.empty')}</p>}
                    <div className="programActions">
                        <button
                            type="button"
                            disabled={rows.length >= MAX_PROGRAM_ENTRIES}
                            onClick={() => setRows([...rows, toProgramRow({ icon: DEFAULT_PROGRAM_ICON, time: '', text: '' })])}
                        >
                            {t('admin.program.add')}
                        </button>
                        <button type="button" onClick={() => setRows(defaultProgram().map(toProgramRow))}>{t('admin.program.default')}</button>
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

export default Program;
