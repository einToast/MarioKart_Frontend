import { IonButton, IonCheckbox, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { OcrConfigModalResult } from "../../util/api/config/interfaces";
import { AdminOcrService, AdminSettingsService, PublicSettingsService } from '../../util/service';
import Toast from '../Toast';

const THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'];

const OcrConfigModal: React.FC<{ showModal: boolean, closeModal: (result: OcrConfigModalResult) => void }> = ({ showModal, closeModal }) => {

    const [providers, setProviders] = useState<string[]>([]);
    const [provider, setProvider] = useState<string>('');
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState<string>('');
    const [thinking, setThinking] = useState<string>('');
    const [standardProvider, setStandardProvider] = useState<string>('');
    const [relativePoints, setRelativePoints] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
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
                setError('Standard-Anbieter gespeichert');
                setIsError(false);
                setShowToast(true);
            })
            .catch(error => showError(error.message));
    };

    const selectProvider = (providerName: string) => {
        setProvider(providerName);
        setModels([]);
        AdminOcrService.getProviderConfig(providerName)
            .then(config => {
                setModel(config.model);
                setThinking(config.thinking);
            })
            .catch(error => showError(error.message));
        // Without the list of models the model is typed in
        AdminOcrService.getProviderModels(providerName)
            .then(setModels)
            .catch(error => showError(error.message));
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
        Promise.all([AdminOcrService.getAvailableProviders(), PublicSettingsService.getSettings()])
            .then(([available, settings]) => {
                const standard = available.find(providerName => providerName === settings.ocrProvider) ?? available[0];
                setProviders(available);
                setStandardProvider(standard ?? '');
                setRelativePoints(settings.relativePoints ?? false);
                if (standard) {
                    selectProvider(standard);
                }
            })
            .catch(error => showError(error.message));
    }, [showModal]);

    // The configured values stay selectable when the provider does not list them
    const modelOptions = models.includes(model) ? models : [model, ...models];
    const thinkingOptions = THINKING_LEVELS.includes(thinking) ? THINKING_LEVELS : [thinking, ...THINKING_LEVELS];

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ ocrConfigChanged: false })}>
            <IonContent>
                <h4>Punkteerkennung</h4>
                {providers.length === 0 ? (
                    <p>Kein Anbieter verfügbar. Für mindestens einen Anbieter muss ein API-Key hinterlegt sein.</p>
                ) : (
                    <form onSubmit={handleChange}>
                        <IonCheckbox labelPlacement="end"
                            checked={relativePoints}
                            onIonChange={(e) => setRelativePoints(e.detail.checked)}
                        >
                            Relative Punkte
                        </IonCheckbox>
                        <div className={"borderContainer"}>
                            <p>Anbieter</p>
                            <select value={provider} onChange={(e) => selectProvider(e.target.value)}
                                style={{ cursor: "pointer" }}
                            >
                                {providers.map((providerName) => (
                                    <option value={providerName} key={providerName}>
                                        {providerName === standardProvider ? `${providerName} (Standard)` : providerName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <IonButton className={"secondary"} expand="block"
                            disabled={provider === standardProvider}
                            onClick={handleSetStandardProvider}
                        >
                            {provider === standardProvider ? 'Standard-Anbieter' : 'Als Standard festlegen'}
                        </IonButton>
                        <div className={"borderContainer"}>
                            <p>Modell</p>
                            {models.length > 0 ? (
                                <select value={model} onChange={(e) => setModel(e.target.value)}
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
                                    placeholder={"Modell eingeben"}
                                />
                            )}
                        </div>
                        <div className={"borderContainer"}>
                            <p>Denkaufwand</p>
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
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} disabled={provider === ''} onClick={handleChange}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleChange();
                            }
                        }}
                    >

                        <div>
                            <p>Konfiguration speichern</p>
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
