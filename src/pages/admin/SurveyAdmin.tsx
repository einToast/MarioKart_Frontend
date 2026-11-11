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
import { useTranslation } from 'react-i18next';

const SURVEY_KEY_MODES = {
    [SurveyKeyMode.DISABLED]: 'disabled',
    [SurveyKeyMode.DISTRIBUTING]: 'distributing',
    [SurveyKeyMode.REQUIRED]: 'required',
} as const;

const SurveyAdmin: React.FC = () => {
    const { t } = useTranslation();
    const [surveys, setSurveys] = useState<QuestionReturnDTO[]>([]);
    const [modalClosed, setModalClosed] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [surveyKeyMode, setSurveyKeyMode] = useState<SurveyKeyMode>(SurveyKeyMode.DISABLED);


    const [error, setError] = useState<string>('');
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
                setError(t(`admin.surveys.keyModes.${SURVEY_KEY_MODES[mode]}.message`));
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
            setError(t('admin.surveys.created'));
            setIsError(false);
            setShowToast(true);
        } else if (result.surveyChanged) {
            setError(t('admin.surveys.changed'));
            setIsError(false);
            setShowToast(true);
        } else if (result.surveyDeleted) {
            setError(t('admin.surveys.deleted'));
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
                        {t('admin.dashboard.surveys')}
                    </LinearGradient>
                </h2>
                <button type="button" className="newSurvey"
                    onClick={() => setShowAddModal(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <IonIcon slot="end" icon={addCircleOutline} aria-hidden="true" />
                    <p>{t('admin.surveys.new')}</p>
                </button>

                <div className="surveyKeyMode">
                    <p>{t('admin.surveys.key')}</p>
                    <select
                        value={surveyKeyMode}
                        onChange={(e) => handleSurveyKeyModeChange(e.target.value as SurveyKeyMode)}
                        aria-label={t('admin.surveys.key')}
                    >
                        <option value={SurveyKeyMode.DISABLED}>{t('admin.surveys.keyModes.disabled.label')}</option>
                        <option value={SurveyKeyMode.DISTRIBUTING}>{t('admin.surveys.keyModes.distributing.label')}</option>
                        <option value={SurveyKeyMode.REQUIRED}>{t('admin.surveys.keyModes.required.label')}</option>
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
