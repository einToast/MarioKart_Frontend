import { IonContent, IonIcon, IonPage, IonToast } from "@ionic/react";
import {
    addCircleOutline,
    arrowBackOutline
} from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import SurveyAdminContainer from "../../components/admin/SurveyAdminContainer";
import SurveyAddModal from "../../components/modals/SurveyAddModal";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { checkToken, getUser } from "../../util/service/loginService";
import { getAllQuestions } from "../../util/service/surveyService";
import "./SurveyAdmin.css";

const SurveyAdmin: React.FC = () => {
    const [surveys, setSurveys] = useState<QuestionReturnDTO[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [toastColor, setToastColor] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();


    const getQuestions = async () => {
        try {
            const questions = await getAllQuestions();
            setSurveys(questions);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleModalClose = (result: SurveyModalResult) => {
        setModalClosed(prev => !prev);
        if (result.surveyCreated) {
            setError('Umfrage erfolgreich erstellt');
            setToastColor(successToastColor);
            setShowToast(true);
        } else if (result.surveyChanged) {
            setError('Umfrage erfolgreich geändert');
            setToastColor(successToastColor);
            setShowToast(true);
        } else if (result.surveyDeleted) {
            setError('Umfrage erfolgreich gelöscht');
            setToastColor(successToastColor);
            setShowToast(true);
        }
    };


    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        getQuestions();
    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            history.push('/admin/dashboard');
                        }
                    }}
                >
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Umfragen
                    </LinearGradient>
                </h2>
                <div className="newSurvey"
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
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error ?? undefined}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default SurveyAdmin;
