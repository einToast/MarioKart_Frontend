import { IonContent, IonIcon, IonPage } from "@ionic/react";
import {
    addCircleOutline,
    arrowBackOutline
} from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import SurveyAdminContainer from "../../components/admin/SurveyAdminContainer";
import SurveyAddModal from "../../components/modals/SurveyAddModal";
import Toast from "../../components/Toast";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from "../../util/service";
import "./SurveyAdmin.css";

const SurveyAdmin: React.FC = () => {
    const [surveys, setSurveys] = useState<QuestionReturnDTO[]>([]);
    const [modalClosed, setModalClosed] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);


    const [error, setError] = useState<string>("Error");
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const user = PublicUserService.getUser();
    const history = useHistory();
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
        if (!PublicUserService.checkToken()) {
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
