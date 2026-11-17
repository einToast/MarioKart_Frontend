import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import "./TournamentSettingsModal.css";
import { TournamentSettingsForm, TournamentSettingsModalResult } from "../../util/api/config/interfaces";
import { AdminSettingsService, PublicSettingsService } from '../../util/service';
import { DEFAULT_LANGUAGE, isLanguage, Language, setBaseLanguage } from '../../i18n/languages';
import LanguageDropdown from '../LanguageDropdown';
import Toast from '../Toast';

const MAX_SURVEY_KEY_DAYS = 400;

const EMPTY_FORM: TournamentSettingsForm = {
    roundMinutes: '',
    rankingHiddenRounds: '',
    maxAnswersPerTeam: '',
    surveyKeyDays: '',
};

const isAtLeast = (value: number | '', min: number): value is number =>
    value !== '' && Number.isInteger(value) && value >= min;

const TournamentSettingsModal: React.FC<{ showModal: boolean, closeModal: (result: TournamentSettingsModalResult) => void }> = ({ showModal, closeModal }) => {
    const { t } = useTranslation();
    const idPrefix = useId();

    const [form, setForm] = useState<TournamentSettingsForm>(EMPTY_FORM);
    const [defaultLanguage, setDefaultLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const showError = (message: string) => {
        setError(message);
        setShowToast(true);
    };

    useEffect(() => {
        if (!showModal) {
            return;
        }
        let active = true;
        setLoaded(false);
        PublicSettingsService.getSettings()
            .then(settings => {
                if (!active) {
                    return;
                }
                setForm({
                    roundMinutes: settings.roundMinutes ?? '',
                    rankingHiddenRounds: settings.rankingHiddenRounds ?? '',
                    maxAnswersPerTeam: settings.maxAnswersPerTeam ?? '',
                    surveyKeyDays: settings.surveyKeyDays ?? '',
                });
                setDefaultLanguage(isLanguage(settings.defaultLanguage) ? settings.defaultLanguage : DEFAULT_LANGUAGE);
                setLoaded(true);
            })
            .catch(error => {
                if (active) {
                    showError(error.message);
                }
            });
        return () => {
            active = false;
        };
    }, [showModal]);

    const handleChange = (field: keyof TournamentSettingsForm, value: string) => {
        setForm(current => ({ ...current, [field]: value === '' ? '' : Number(value) }));
    };

    const handleSave = () => {
        const { roundMinutes, rankingHiddenRounds, maxAnswersPerTeam, surveyKeyDays } = form;
        if (!isAtLeast(roundMinutes, 1) || !isAtLeast(rankingHiddenRounds, 0)
            || !isAtLeast(maxAnswersPerTeam, 1) || !isAtLeast(surveyKeyDays, 1)) {
            showError(t('admin.tournamentSettings.invalidNumbers'));
            return;
        }
        if (surveyKeyDays > MAX_SURVEY_KEY_DAYS) {
            showError(t('admin.tournamentSettings.invalidSurveyKeyDays', { max: MAX_SURVEY_KEY_DAYS }));
            return;
        }

        AdminSettingsService.updateTournamentSettings(roundMinutes, rankingHiddenRounds, maxAnswersPerTeam, surveyKeyDays, defaultLanguage)
            .then(() => {
                setBaseLanguage(defaultLanguage);
                closeModal({ settingsChanged: true });
            })
            .catch(error => showError(error.message));
    };

    const numberField = (field: keyof TournamentSettingsForm, min: number, hint?: string) => (
        <div className="borderContainer">
            <p id={`${idPrefix}${field}`}>{t(`admin.tournamentSettings.${field}`)}</p>
            <input
                type="number"
                min={min}
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                aria-labelledby={`${idPrefix}${field}`}
            />
            {hint && <p className="fieldHint">{hint}</p>}
        </div>
    );

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ settingsChanged: false })}>
            <IonContent>
                <h4>{t('admin.tournamentSettings.title')}</h4>
                {loaded && <form className="tournamentSettingsForm" onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}>
                    <div className="borderContainer">
                        <div className="languageField">
                            <p id={`${idPrefix}defaultLanguage`}>{t('admin.tournamentSettings.defaultLanguage')}</p>
                            <LanguageDropdown
                                value={defaultLanguage}
                                onChange={setDefaultLanguage}
                                label={t('admin.tournamentSettings.defaultLanguage')}
                                labelId={`${idPrefix}defaultLanguage`}
                            />
                        </div>
                        <p className="fieldHint">{t('admin.tournamentSettings.defaultLanguageHint')}</p>
                    </div>
                    {numberField('roundMinutes', 1, t('admin.tournamentSettings.roundMinutesHint'))}
                    {numberField('rankingHiddenRounds', 0, t('admin.tournamentSettings.rankingHiddenRoundsHint'))}
                    {numberField('maxAnswersPerTeam', 1)}
                    {numberField('surveyKeyDays', 1)}
                </form>}
                <div className={"playedContainer"}>
                    <IonButton className={"secondary round"} onClick={() => closeModal({ settingsChanged: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ settingsChanged: false });
                            }
                        }}
                    >
                        <div>
                            <p>{t('common.cancel')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleSave} disabled={!loaded}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (loaded && (e.key === 'Enter' || e.key === ' ')) {
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
                isError={true}
            />
        </IonModal>
    );
};

export default TournamentSettingsModal;
