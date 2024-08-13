import {IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import '../interface/interfaces'
import Header from "../components/Header";
import {LinearGradient} from "react-text-gradients";
import {arrowForwardOutline} from "ionicons/icons";
import {useHistory} from "react-router";
import {useEffect, useState} from "react";
import axios from "axios";
import './Survey.css'

const Survey: React.FC = () => {
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [currentSurveyId, setCurrentSurveyId] = useState(null);


    useEffect(() => {
        const getSurvey = async () => {
            try {
                const survey = await axios.get('http://localhost:3000/api/survey');
                const newSurveyId = survey.data.id;
                setCurrentSurveyId(newSurveyId);

                const response = await axios.get(`http://localhost:3000/api/survey/${newSurveyId}`);
                const currentSurveyInterface = response.data;
                setCurrentSurvey(currentSurveyInterface);
                setSurveySubmitted(false); // Reset the survey submission state
            } catch (error) {
                console.log(error);
            }
        };

        getSurvey();
    }, [currentSurveyId]);

    const handleTeamClick = async (team) => {
        const response = await axios.post('http://localhost:3000/api/vote', { teamName: team.name })
                .then((response) => {
                    console.log(response.data);

                    setSurveySubmitted(true);
                    localStorage.setItem(`surveySubmitted_${currentSurveyId}`, 'true');
                })
                .catch((error) => {
                    console.error('Error posting vote:', error);
                });

        setSurveySubmitted(true); // Hide the survey once a team is clicked
    };

    return (
        <IonPage>
            <Header></Header>
            <IonContent fullscreen>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Abstimmungen
                    </LinearGradient>
                </h1>

                {currentSurvey ? (
                    currentSurvey.active && !surveySubmitted && localStorage.getItem(`surveySubmitted_${currentSurveyId}`) !== 'true' ? (
                        <>
                            <p>{currentSurvey.question}</p>
                            {currentSurvey.teams.map((team, index) => (
                                <div className="survey" key={index} onClick={() => handleTeamClick(team)}>
                                    <div className="teamContainer">
                                        <div className="imageContainer">
                                            <img src={`../resources/media/${team.character}.png`} alt={team.character} />
                                        </div>
                                        <div className="surveyContent">
                                            <p>{team.name}</p>
                                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div>
                            <p>Aktuell liegt keine Abstimmung vor. Komme später wieder.</p>
                            <IonButton href={"/tab1"}>
                                <div>
                                    <p>Zurück zum Spielplan</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </div>
                    )
                ) : (
                    <p>Lade Umfrage...</p>
                )}



            </IonContent>
        </IonPage>
    );
};

export default Survey;
