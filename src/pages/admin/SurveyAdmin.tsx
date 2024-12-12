import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {IonContent, IonIcon, IonPage, IonToast} from "@ionic/react";
import {
    addCircleOutline,
    arrowBackOutline,
    chatboxEllipsesOutline,
    chatboxOutline, createOutline,
    eyeOffOutline,
    eyeOutline, pencil,
    statsChartOutline,
    trashOutline,
    videocamOffOutline,
    videocamOutline
} from 'ionicons/icons';
import "./SurveyAdmin.css"
import React, {useEffect, useState} from "react";
import SurveyAddModal from "../../components/modals/SurveyAddModal";
import {useHistory} from "react-router";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import {getUser} from "../../util/service/loginService";
import {QuestionReturnDTO} from "../../util/api/config/dto";
import {changeQuestion, getAllQuestions} from "../../util/service/surveyService";
import SurveyModal from "../../components/modals/SurveyModal";
import {QuestionType} from "../../util/service/util";
import SurveyChangeModal from "../../components/modals/SurveyChangeModal";

const surveyAdmin: React.FC<LoginProps> = (props: LoginProps) => {
    //TODO: new Survey adden

    const surveysNew = [
    ];
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionReturnDTO>({id: -1, questionText: '',questionType: QuestionType.MULTIPLE_CHOICE, options:[],visible: false, active: false, live: false});
    const [results, setResults] = useState([]);
    const [surveys, setSurveys] = useState<QuestionReturnDTO[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [toastColor, setToastColor] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const user = getUser();

    const history = useHistory();

    const toggleVisibility = async (id: number) => {
        console.log(id);
        try{
            const question = surveys.find(survey => survey.id === id);
            if (!question) {
                throw new TypeError('Frage nicht gefunden');
            }
            question.visible = !question.visible;
            if (question.visible) {
                question.active = true;
            }
            const updatedQuestion = await changeQuestion(question);
            if (updatedQuestion) {
                getQuestions();
            } else {
                throw new TypeError('Sichtbarkeit konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }

    };

    const toggleActive = async (id: number) => {
        try{
            const question = surveys.find(survey => survey.id === id);
            if (!question) {
                throw new TypeError('Frage nicht gefunden');
            }
            question.active = !question.active;
            const updatedQuestion = await changeQuestion(question);
            if (updatedQuestion) {
                getQuestions();
            } else {
                throw new TypeError('Aktivität konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const toggleLive = async (id: number) => {
        try{
            const question = surveys.find(survey => survey.id === id);
            if (!question) {
                throw new TypeError('Frage nicht gefunden');
            }
            question.live = !question.live;
            const updatedQuestion = await changeQuestion(question);
            if (updatedQuestion) {
                getQuestions();
            } else {
                throw new TypeError('Live konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleOpenResults = (question) => {
        setSelectedQuestion(question);
        setShowResultsModal(true);
    }

    const handleOpenChange = (question) => {
        setSelectedQuestion(question);
        setShowChangeModal(true);
    }


    const closeModal = (surveys:Object) => {
        setModalClosed(prev => !prev);
        if (surveys.surveyCreated) {
            setError('Umfrage erfolgreich erstellt');
            setToastColor(successToastColor);
            setShowToast(true);
        }

    };

    const getQuestions = async () => {
        try{
            const questions = await getAllQuestions();
            setSurveys(questions);
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    useEffect(() => {
        getQuestions();
    }, [modalClosed]);


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
                <div className={"newSurvey"} onClick={() => setShowAddModal(true)}
                     tabIndex={0}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             setShowAddModal(true);
                         }
                     }}
                     style={{cursor: 'pointer'}}
                >
                    <IonIcon slot="end" icon={addCircleOutline}></IonIcon>
                    <p>Neue Abstimmung</p>
                </div>

                <div className="currentSurveyContainer">
                    {surveysNew.map((survey, index) => (
                        <div key={index} className="currentSurvey">
                            <p>{survey.question}</p>
                        </div>
                    ))}
                </div>

                <h3>Aktuelle Abstimmungen</h3>
                <div className="currentSurveyContainer">
                    {surveys.map(survey => (
                        <div key={survey.id} className={`currentSurvey ${survey.visible ? 'active' : ''}`}>
                            <p>{survey.questionText}</p>
                            <div>
                                <IonIcon
                                    slot="end"
                                    icon={statsChartOutline}
                                    onClick={() => handleOpenResults(survey)}
                                    style={{cursor: 'pointer', marginRight: '10px'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleOpenResults(survey);
                                        }
                                    }}
                                />
                                <IonIcon
                                    slot="end"
                                    icon={createOutline}
                                    onClick={() => handleOpenChange(survey)}
                                    style={{cursor: 'pointer'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleOpenChange(survey);
                                        }
                                    }}
                                />
                                <IonIcon
                                    slot="end"
                                    icon={survey.visible ? eyeOutline : eyeOffOutline}
                                    onClick={() => toggleVisibility(survey.id)}
                                    style={{cursor: 'pointer'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleVisibility(survey.id);
                                        }
                                    }}
                                />
                                <IonIcon
                                    slot="end"
                                    icon={survey.active ? chatboxEllipsesOutline : chatboxOutline}
                                    onClick={() => toggleActive(survey.id)}
                                    style={{cursor: 'pointer'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleVisibility(survey.id);
                                        }
                                    }}
                                />
                                <IonIcon
                                    slot="end"
                                    icon={survey.live ? videocamOutline : videocamOffOutline}
                                    onClick={() => toggleLive(survey.id)}
                                    style={{cursor: 'pointer'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleVisibility(survey.id);
                                        }
                                    }}
                                />
                                <IonIcon
                                    slot="end"
                                    icon= {trashOutline}
                                    // onClick={() => toggleVisibility(survey.id)}
                                    style={{cursor: 'pointer'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            toggleVisibility(survey.id);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <SurveyAddModal
                    showModal={showAddModal}
                    closeModal={(surveys) => {
                        setShowAddModal(false);
                        closeModal(surveys);
                    }}
                />
                <SurveyModal
                    showModal={showResultsModal}
                    closeModal={() => setShowResultsModal(false)}
                    question={selectedQuestion}
                />
                <SurveyChangeModal
                    showModal={showChangeModal}
                    closeModal={() => setShowChangeModal(false)}
                    question={selectedQuestion}
                />


            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    )
        ;
};

export default surveyAdmin;
