import {IonAccordionGroup, IonContent, IonPage} from '@ionic/react';
import '../interface/interfaces'
import Header from "../components/Header";
import {LinearGradient} from "react-text-gradients";
import React, {useEffect, useRef, useState} from "react";
import './Survey.css'
import {QuestionReturnDTO} from "../util/api/config/dto";
import {getCurrentQuestions} from "../util/service/surveyService";
import CheckBoxCard from "../components/cards/CheckboxCard";

const Survey: React.FC = () => {
    const [currentQuestions, setCurrentQuestions] = useState<QuestionReturnDTO[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array


    const getQuestions = async () => {
        const questions = getCurrentQuestions();

        questions.then((questions) => {
            console.log(questions);
            setCurrentQuestions(questions);
        });
    };


    useEffect(() => {
        getQuestions();

        // const myQuestion: QuestionReturnDTO = {
        //     id: 1,
        //     questionText: "Welches Team ist besser?",
        //     questionType: QuestionType.CHECKBOX,
        //     options: ["Team A", "Team B", "Team C", "Team D"],
        //     active: true
        // }
        // setCurrentQuestions([myQuestion]);
    }, []);

    // const handleTeamClick = async (team) => {
    //     const response = await axios.post('http://localhost:3000/api/vote', { teamName: team.name })
    //             .then((response) => {
    //                 console.log(response.data);
    //
    //                 setSurveySubmitted(true);
    //                 localStorage.setItem(`surveySubmitted_${currentSurveyId}`, 'true');
    //             })
    //             .catch((error) => {
    //                 console.error('Error posting vote:', error);
    //             });
    //
    //     setSurveySubmitted(true); // Hide the survey once a team is clicked
    // };

    const toggleAccordion = (accordionId: string) => {
        setOpenAccordions(prevOpenAccordions =>
            prevOpenAccordions.includes(accordionId)
                ? prevOpenAccordions.filter(id => id !== accordionId) // Remove the accordion from the list
                : [...prevOpenAccordions, accordionId] // Add the accordion to the list
        );
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
                {currentQuestions.length > 0 ? (
                    <IonAccordionGroup ref={accordionGroupRef} value={openAccordions}>
                        {currentQuestions.map((question, index) => (
                            <CheckBoxCard
                                key={question.id}
                                checkboxQuestion={question}
                                isOpen={openAccordions.includes(question.id.toString())}
                                toggleAccordion={() => toggleAccordion(question.id.toString())}
                            />
                        ))}
                    </IonAccordionGroup>
                ) : (
                    <p>Lade Umfrage...</p>
                )}

            </IonContent>
        </IonPage>
    );
};

export default Survey;
