import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonModal
} from "@ionic/react";
import {
    addCircleOutline,
    arrowBackOutline,
    arrowForwardOutline,
    eyeOffOutline,
    eyeOutline,
    statsChartOutline
} from 'ionicons/icons';
import "./SurveyAdmin.css"
import {useState} from "react";
import SurveyCreation from "../../components/SurveyCreation";
import {useHistory} from "react-router";

const surveyAdmin: React.FC<LoginProps> = (props: LoginProps) => {
    //TODO: new Survey adden

    const [surveys, setSurveys] = useState([
        { id: 1, question: 'Welche Pizza ist als erstes leer?', visible: true },
        { id: 2, question: 'Welches Team wird gewinnen?', visible: true },
    ]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [selectedSurveyQuestion, setSelectedSurveyQuestion] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [results, setResults] = useState([]);
    const [surveysNew, setSurveysNew] = useState([]);
    const [showModalNew, setShowModalNew] = useState(false);

    const history = useHistory();

    const toggleVisibility = (id) => {
        setSurveys(surveys.map(survey =>
            survey.id === id ? { ...survey, visible: !survey.visible } : survey
        ));
    };

    const openResults = (survey) => {
        const surveyResults = fetchResults(survey.id);
        setResults(surveyResults);
        setSelectedSurvey(survey.id);
        setSelectedSurveyQuestion(survey.question);
        setShowModal(true);
    };

    const fetchResults = (id) => {
        // Simulate fetching results from an API or other source
        const mockResults = {
            1: [
                { id: 1, name: 'Funghi', punkte: '36' },
                { id: 2, name: 'Hawaii',  punkte: '45' },
                { id: 3, name: 'Salami', punkte: '85' },
                { id: 4, name: 'Vegetarian',  punkte: '26' },
            ], // Keine Ergebnisse für die erste Frage
            2: [
                { id: 1, name: 'FSR', character: 'toad', punkte: '36' },
                { id: 2, name: 'Ninja Turtles', character: 'koopa', punkte: '45' },
                { id: 3, name: 'Mitarbeiter', character: 'tanuki-mario', punkte: '85' },
                { id: 4, name: 'Toadesser', character: 'donkey-kong', punkte: '26' },
            ],
        };
        return mockResults[id] || [];
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSurvey(null);
        setSelectedSurveyQuestion('');
    };

    const createSurvey = (survey) => {
        setSurveys([...surveys, survey]);
    };


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
                <div className={"newSurvey"} onClick={() => setShowModalNew(true)}
                     tabIndex={0}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             setShowModalNew(true);
                         }
                     }}
                >
                    <IonIcon slot="end" icon={addCircleOutline}></IonIcon>
                    <p>Neue Abstimmung</p>
                </div>

                <SurveyCreation
                    showModal={showModalNew}
                    closeModal={() => setShowModalNew(false)}
                    createSurvey={createSurvey}
                />
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
                            <p>{survey.question}</p>
                            <div>
                                <IonIcon
                                    slot="end"
                                    icon={statsChartOutline}
                                    onClick={() => openResults(survey)}
                                    style={{cursor: 'pointer', marginRight: '10px'}}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            openResults(survey);
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
                            </div>
                        </div>
                    ))}

                    <IonModal isOpen={showModal} onDidDismiss={closeModal}>
                        <IonContent>
                            <h4>{selectedSurveyQuestion}</h4>
                            {selectedSurvey === 2 ? (
                                <>
                                    <h4>Ergebnisse:</h4>
                                    <div className={"allTeamResult"}>
                                        {
                                            results.map(team => (
                                                <div key={team.id} className={"teamContainer"}>
                                                    <div className={"imageContainer"}>
                                                        <img src={`../resources/media/${team.character}.png`}
                                                             alt={team.character}
                                                             className={"iconTeam"}/>
                                                    </div>
                                                    <div className={"teamResult"}>
                                                        <p>{team.name}</p>
                                                        <p className={"punkte"}>{team.punkte} Punkte</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            ) : (
                                <ul>
                                    {results.map((result) => (
                                        <li key={result.id}>{result.name}: {result.punkte}</li>
                                    ))}
                                </ul>
                            )}
                            <IonButton onClick={closeModal} className={"round"}
                                       tabIndex={0}
                                       onKeyDown={(e) => {
                                           if (e.key === 'Enter' || e.key === ' ') {
                                               closeModal();
                                           }
                                       }}
                            >
                                <div>
                                    <p>Ergebnisse schließen</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </IonContent>
                    </IonModal>
                </div>

            </IonContent>
        </IonPage>
    )
        ;
};

export default surveyAdmin;
