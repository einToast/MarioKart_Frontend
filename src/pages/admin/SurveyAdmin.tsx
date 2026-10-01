import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { addCircleOutline } from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import BackLink from "../../components/admin/BackLink";
import SurveyAdminContainer from "../../components/admin/SurveyAdminContainer";
import SurveyAddModal from "../../components/modals/SurveyAddModal";
import Toast from "../../components/Toast";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSettingsService, AdminSurveyService, PublicCookiesService, PublicSettingsService } from "../../util/service";
import { SurveyKeyMode } from "../../util/service/util";
import "./SurveyAdmin.css";

const SURVEY_KEY_MODE_MESSAGES: Record<SurveyKeyMode, string> = {
    [SurveyKeyMode.DISABLED]: 'Umfrage-Schlüssel deaktiviert, alle können abstimmen',
    [SurveyKeyMode.DISTRIBUTING]: 'Geräte erhalten bei ihrer ersten Antwort einen Umfrage-Schlüssel',
    [SurveyKeyMode.REQUIRED]: 'Nur Geräte mit Umfrage-Schlüssel können abstimmen',
};

const SurveyAdmin: React.FC = () => {
    const [surveys, setSurveys] = useState<QuestionReturnDTO[]>([]);
    const [modalClosed, setModalClosed] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [surveyKeyMode, setSurveyKeyMode] = useState<SurveyKeyMode>(SurveyKeyMode.DISABLED);


    const [error, setError] = useState<string>("Error");
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();


    const getQuestions = () => {
        AdminSurveyService.getQuestions()
            .then(questions => {
                setSurveys(questions);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    const getSurveyKeyMode = () => {
        PublicSettingsService.getSurveyKeyMode()
            .then(mode => {
                setSurveyKeyMode(mode);
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    };

    const handleSurveyKeyModeChange = (mode: SurveyKeyMode) => {
        AdminSettingsService.updateSurveyKeyMode(mode)
            .then(settings => {
                setSurveyKeyMode(settings.surveyKeyMode ?? mode);
                setError(SURVEY_KEY_MODE_MESSAGES[mode]);
                setIsError(false);
                setShowToast(true);
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    };

    const handleModalClose = (result: SurveyModalResult) => {
        setModalClosed(prev => !prev);
        if (result.surveyCreated) {
            setError('Umfrage erfolgreich erstellt');
            setIsError(false);
            setShowToast(true);
        } else if (result.surveyChanged) {
            setError('Umfrage erfolgreich geändert');
            setIsError(false);
            setShowToast(true);
        } else if (result.surveyDeleted) {
            setError('Umfrage erfolgreich gelöscht');
            setIsError(false);
            setShowToast(true);
        }
    };


    useEffect(() => {
        const loadData = async () => {
            const isAuthenticated = await PublicCookiesService.checkToken();
            if (!isAuthenticated) {
                window.location.assign('/admin/login');
                return;
            }
            getQuestions();
            getSurveyKeyMode();
        };

        loadData().catch(error => {
            setError(error.message);
            setIsError(true);
            setShowToast(true);
        });
    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <BackLink />
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Umfragen
                    </LinearGradient>
                </h2>
                <div className="newSurvey"
                    role="button"
                    onClick={() => setShowAddModal(true)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setShowAddModal(true);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <IonIcon slot="end" icon={addCircleOutline} />
                    <p>Neue Abstimmung</p>
                </div>

                <div className="surveyKeyMode">
                    <p>Umfrage-Schlüssel</p>
                    <select
                        value={surveyKeyMode}
                        onChange={(e) => handleSurveyKeyModeChange(e.target.value as SurveyKeyMode)}
                        aria-label="Umfrage-Schlüssel"
                    >
                        <option value={SurveyKeyMode.DISABLED}>Aus</option>
                        <option value={SurveyKeyMode.DISTRIBUTING}>Schlüssel verteilen</option>
                        <option value={SurveyKeyMode.REQUIRED}>Nur mit Schlüssel</option>
                    </select>
                </div>

                <SurveyAdminContainer
                    surveys={surveys}
                    getQuestions={getQuestions}
                    handleModalClose={handleModalClose}
                />
                <SurveyAddModal
                    showModal={showAddModal}
                    closeModal={(result) => {
                        setShowAddModal(false);
                        handleModalClose(result);
                    }}
                />
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

export default SurveyAdmin;
