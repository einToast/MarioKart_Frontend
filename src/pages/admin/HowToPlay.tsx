import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import { useTranslation } from 'react-i18next';
import BackLink from "../../components/admin/BackLink";
import TranslationLanguageTabs from "../../components/admin/TranslationLanguageTabs";
import Toast from "../../components/Toast";
import { Language } from "../../i18n/languages";
import { useBaseLanguage } from "../../hooks/useBaseLanguage";
import { translatedChange, translatedValue } from "../../i18n/translatable";
import { HowToPlayRule, HowToPlayRuleRow, TextTranslation } from "../../util/api/config/interfaces";
import {
    defaultHowToPlay,
    MAX_RULE_TEXT_LENGTH,
    MAX_RULES,
    MAX_VIDEO_URL_LENGTH,
    parseHowToPlay,
    serializeHowToPlay,
    toRuleRow,
    youtubeEmbedUrl,
} from "../../util/layout/howToPlay";
import { AdminSettingsService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import '../RegisterTeam.css';
import "./Points.css";
import "./Program.css";
import "./HowToPlay.css";

const HowToPlay: React.FC = () => {
    const { t } = useTranslation();
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [rows, setRows] = useState<HowToPlayRuleRow[]>([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const baseLanguage = useBaseLanguage();
    const [editLanguage, setEditLanguage] = useState<Language>(baseLanguage);

    const [error, setError] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const showError = (message: string) => {
        setError(message);
        setIsError(true);
        setShowToast(true);
    };

    const loadDefault = async () => {
        const howToPlay = await defaultHowToPlay();
        setVideoUrl(howToPlay.videoUrl);
        setRows(howToPlay.rules.map(toRuleRow));
    };

    useEffect(() => {
        const loadHowToPlay = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }

            const settings = await PublicSettingsService.getSettings();
            const stored = parseHowToPlay(settings.howToPlay);
            if (stored) {
                setVideoUrl(stored.videoUrl);
                setRows(stored.rules.map(toRuleRow));
            } else {
                await loadDefault();
            }
        };

        loadHowToPlay().catch(error => showError(error.message));
    }, [location]);

    const handleChange = (index: number, changes: Partial<HowToPlayRule>) => {
        setRows(current => current.map((row, position) => position === index ? { ...row, rule: { ...row.rule, ...changes } } : row));
    };

    const handleMove = (index: number, offset: number) => {
        setRows(current => {
            const moved = [...current];
            [moved[index], moved[index + offset]] = [moved[index + offset], moved[index]];
            return moved;
        });
    };

    const handleSave = () => {
        const trimmedUrl = videoUrl.trim();
        if (trimmedUrl !== '' && !youtubeEmbedUrl(trimmedUrl)) {
            showError(t('admin.howToPlay.invalidVideo'));
            return;
        }
        const rules = rows.map(({ rule }) => ({ ...rule, text: rule.text.trim() }));
        if (rules.some(rule => rule.text === '')) {
            showError(t('admin.howToPlay.textRequired'));
            return;
        }

        setButtonDisabled(true);
        AdminSettingsService.updateHowToPlay(serializeHowToPlay({ videoUrl: trimmedUrl, rules }))
            .then(() => {
                setVideoUrl(trimmedUrl);
                setRows(rows.map((row, position) => ({ ...row, rule: rules[position] })));
                setError(t('admin.howToPlay.saved'));
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
                        {t('admin.howToPlay.title')}
                    </LinearGradient>
                </h2>
                <p>{t('admin.howToPlay.description')}</p>
                <div className="howToPlayVideo">
                    <label htmlFor="howToPlayVideo">{t('admin.howToPlay.videoUrl')}</label>
                    <input id="howToPlayVideo"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        maxLength={MAX_VIDEO_URL_LENGTH}
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <p>{t('admin.howToPlay.videoHint')}</p>
                </div>
                <TranslationLanguageTabs value={editLanguage} onChange={setEditLanguage} />

                <div className="programList">
                    {rows.map(({ key: rowKey, rule }, index) => (
                        <div className="programRow" key={rowKey}>
                            <input
                                type="text"
                                className="howToPlayRule"
                                aria-label={t('admin.howToPlay.ruleOf', { number: index + 1 })}
                                maxLength={MAX_RULE_TEXT_LENGTH}
                                placeholder={editLanguage === baseLanguage ? undefined : rule.text}
                                value={translatedValue<TextTranslation, 'text'>(rule, 'text', editLanguage) ?? ''}
                                onChange={(e) => handleChange(index, translatedChange<TextTranslation, 'text'>(rule, 'text', editLanguage, e.target.value))}
                            />
                            <button type="button" aria-label={t('admin.howToPlay.moveUp', { number: index + 1 })} disabled={index === 0} onClick={() => handleMove(index, -1)}>↑</button>
                            <button type="button" aria-label={t('admin.howToPlay.moveDown', { number: index + 1 })} disabled={index === rows.length - 1} onClick={() => handleMove(index, 1)}>↓</button>
                            <button type="button" aria-label={t('admin.howToPlay.remove', { number: index + 1 })} onClick={() => setRows(rows.filter((_, position) => position !== index))}>✕</button>
                        </div>
                    ))}
                    {rows.length === 0 && <p>{t('admin.howToPlay.empty')}</p>}
                    <div className="programActions">
                        <button
                            type="button"
                            disabled={rows.length >= MAX_RULES}
                            onClick={() => setRows([...rows, toRuleRow({ text: '' })])}
                        >
                            {t('admin.howToPlay.add')}
                        </button>
                        <button type="button" onClick={() => loadDefault().catch(error => showError(error.message))}>{t('admin.howToPlay.default')}</button>
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

export default HowToPlay;
