import { IonButton, IonCheckbox, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useId, useRef, useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { OcrConfigModalResult } from "../../util/api/config/interfaces";
import { AdminOcrService, AdminSettingsService, PublicSettingsService } from '../../util/service';
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';

const THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'];

const OcrConfigModal: React.FC<{ showModal: boolean, closeModal: (result: OcrConfigModalResult) => void }> = ({ showModal, closeModal }) => {
    const { t } = useTranslation();
    const modelLabelId = useId();

    const [providers, setProviders] = useState<string[] | null>(null);
    const [provider, setProvider] = useState<string>('');
    const shownProvider = useRef<string>('');
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState<string>('');
    const [thinking, setThinking] = useState<string>('');
    const [standardProvider, setStandardProvider] = useState<string>('');
    const [relativePoints, setRelativePoints] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const showError = (message: string) => {
        setError(message);
        setIsError(true);
        setShowToast(true);
    };

    const handleSetStandardProvider = () => {
        AdminSettingsService.updateOcrProvider(provider)
            .then(() => {
                setStandardProvider(provider);
                setError(t('admin.ocr.defaultSaved'));
                setIsError(false);
                setShowToast(true);
            })
            .catch(error => showError(error.message));
    };

    const selectProvider = (providerName: string) => {
        shownProvider.current = providerName;
        setProvider(providerName);
        setModels([]);
        setConfigLoaded(false);
        const isShown = () => shownProvider.current === providerName;
        AdminOcrService.getProviderConfig(providerName)
            .then(config => {
                if (isShown()) {
                    setModel(config.model);
                    setThinking(config.thinking);
                    setConfigLoaded(true);
                }
            })
            .catch(error => {
                if (isShown()) {
                    showError(error.message);
                }
            });
        // Without the list of models the model is typed in
        AdminOcrService.getProviderModels(providerName)
            .then(providerModels => {
                if (isShown()) {
                    setModels(providerModels);
                }
            })
            .catch(error => {
                if (isShown()) {
                    showError(error.message);
                }
            });
    };

    const handleChange = () => {
        Promise.all([
            AdminOcrService.updateProviderConfig(provider, { model: model.trim(), thinking }),
            AdminSettingsService.updateRelativePoints(relativePoints),
        ])
            .then(() => closeModal({ ocrConfigChanged: true }))
            .catch(error => showError(error.message));
    };

    useEffect(() => {
        if (!showModal) {
            return;
        }
        let active = true;
        setProviders(null);
        setConfigLoaded(false);
        Promise.all([AdminOcrService.getAvailableProviders(), PublicSettingsService.getSettings()])
            .then(([available, settings]) => {
                if (!active) {
                    return;
                }
                const standard = available.find(providerName => providerName === settings.ocrProvider) ?? available[0];
                setProviders(available);
                setStandardProvider(standard ?? '');
                setRelativePoints(settings.relativePoints ?? false);
                if (standard) {
                    selectProvider(standard);
                }
            })
            .catch(error => {
                if (active) {
                    showError(error.message);
                }
            });
        return () => {
            active = false;
            shownProvider.current = '';
        };
    }, [showModal]);

    // The configured values stay selectable when the provider does not list them
    const modelOptions = models.includes(model) ? models : [model, ...models];
    const thinkingOptions = THINKING_LEVELS.includes(thinking) ? THINKING_LEVELS : [thinking, ...THINKING_LEVELS];

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ ocrConfigChanged: false })}>
            <IonContent>
                <h4>{t('admin.ocr.title')}</h4>
                {providers?.length === 0 && <p>{t('admin.ocr.noProvider')}</p>}
                {providers && providers.length > 0 && (
                    <form onSubmit={handleChange}>
                        <IonCheckbox labelPlacement="end"
                            checked={relativePoints}
                            onIonChange={(e) => setRelativePoints(e.detail.checked)}
                        >
                            {t('admin.ocr.relativePoints')}
                        </IonCheckbox>
                        <div className={"borderContainer"}>
                            <p>{t('admin.ocr.provider')}</p>
                            <select value={provider} onChange={(e) => selectProvider(e.target.value)}
                                style={{ cursor: "pointer" }}
                            >
                                {providers.map((providerName) => (
                                    <option value={providerName} key={providerName}>
                                        {providerName === standardProvider ? t('admin.points.defaultProvider', { provider: providerName }) : providerName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <IonButton className={"secondary"} expand="block"
                            disabled={provider === standardProvider}
                            onClick={handleSetStandardProvider}
                        >
                            {provider === standardProvider ? t('admin.ocr.defaultProvider') : t('admin.ocr.makeDefault')}
                        </IonButton>
                        <div className={"borderContainer"}>
                            <p id={modelLabelId}>{t('admin.ocr.model')}</p>
                            {models.length > 0 ? (
                                <select value={model} onChange={(e) => setModel(e.target.value)}
                                    aria-labelledby={modelLabelId}
                                    style={{ cursor: "pointer" }}
                                >
                                    {modelOptions.map((modelName) => (
                                        <option value={modelName} key={modelName}>{modelName}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={t('admin.ocr.modelPlaceholder')}
                                    aria-labelledby={modelLabelId}
                                />
                            )}
                        </div>
                        <div className={"borderContainer"}>
                            <p>{t('admin.ocr.thinking')}</p>
                            <select value={thinking} onChange={(e) => setThinking(e.target.value)}
                                style={{ cursor: "pointer" }}
                            >
                                {thinkingOptions.map((level) => (
                                    <option value={level} key={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                )}
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={() => closeModal({ ocrConfigChanged: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ ocrConfigChanged: false });
                            }
                        }}
                    >
                        <div>
                            <p>{t('common.cancel')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} disabled={!configLoaded} onClick={handleChange}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (configLoaded && (e.key === 'Enter' || e.key === ' ')) {
                                handleChange();
                            }
                        }}
                    >

                        <div>
                            <p>{t('admin.ocr.save')}</p>
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
        </IonModal>
    );
};

export default OcrConfigModal;
