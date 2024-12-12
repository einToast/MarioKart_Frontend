import {IonAccordionGroup, IonContent, IonPage} from '@ionic/react';
import '../interface/interfaces'
import Header from "../components/Header";
import {LinearGradient} from "react-text-gradients";
import React, {useEffect, useRef, useState} from "react";
import './Survey.css'
import {QuestionReturnDTO} from "../util/api/config/dto";
import {getAnswer, getAnswers, getCurrentQuestions} from "../util/service/surveyService";
import {useHistory, useLocation} from "react-router";
import {QuestionType} from "../util/service/util";
import MultipleChoiceCard from "../components/cards/MultipleChoiceCard";
import FreeTextCard from "../components/cards/FreeTextCard";
import CheckBoxCard from "../components/cards/CheckBoxCard";

const Survey: React.FC = () => {
    const [currentQuestions, setCurrentQuestions] = useState<QuestionReturnDTO[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]); // Start with an empty array

    const history = useHistory();
    const location = useLocation();


    const getQuestions = async () => {
        const questions = getCurrentQuestions();

        questions.then(async (questions) => {
            const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
                const answers = await getAnswer(question.questionText + question.id);
                return {
                    ...question,
                    isAnswered: answers !== -1,
                }
            }));
            questionsWithAnswers.sort((a, b) => {
                if (a.active !== b.active) {
                    return a.active ? -1 : 1;
                }

                if (a.isAnswered !== b.isAnswered) {
                    return a.isAnswered ? 1 : -1;
                }

                if (a.isAnswered && b.isAnswered) {
                    if (a.questionType === QuestionType.FREE_TEXT && b.questionType !== QuestionType.FREE_TEXT) {
                        return -1;
                    }
                    if (b.questionType === QuestionType.FREE_TEXT && a.questionType !== QuestionType.FREE_TEXT) {
                        return 1;
                    }
                }

                if (a.questionType === QuestionType.FREE_TEXT && b.questionType !== QuestionType.FREE_TEXT) {
                    return a.isAnswered ? 1 : 1; // Unbeantwortet oder abgeschlossen -> nach unten
                }
                if (b.questionType === QuestionType.FREE_TEXT && a.questionType !== QuestionType.FREE_TEXT) {
                    return b.isAnswered ? -1 : -1; // Unbeantwortet oder abgeschlossen -> nach unten
                }

                return 0;
            });

            setCurrentQuestions(questionsWithAnswers);
        });
    };


    useEffect(() => {
        getQuestions();

    }, [location]);

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
                            (question.questionType === QuestionType.MULTIPLE_CHOICE) ? (
                                <MultipleChoiceCard
                                    key={question.id}
                                    multipleChoiceQuestion={question}
                                    isOpen={openAccordions.includes(question.id.toString())}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (question.questionType === QuestionType.CHECKBOX) ? (
                                <CheckBoxCard
                                    key={question.id}
                                    checkBoxQuestion={question}
                                    isOpen={openAccordions.includes(question.id.toString())}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (question.questionType === QuestionType.FREE_TEXT) ? (
                                <FreeTextCard
                                    key={question.id}
                                    freeTextQuestion={question}
                                    isOpen={openAccordions.includes(question.id.toString())}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (
                                <p key={question.id}> Fehler </p>
                            )
                        ))}
                    </IonAccordionGroup>
                ) : (
                    <p>Gerade finden keine Abstimmungen statt.</p>
                )}

            </IonContent>
        </IonPage>
    );
};

export default Survey;
