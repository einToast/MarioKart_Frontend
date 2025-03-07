import { IonAccordionGroup, IonContent, IonPage } from '@ionic/react';
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import CheckBoxCard from "../components/survey/CheckBoxSurveyComponent";
import FreeTextCard from "../components/survey/FreeTextSurveyComponent";
import MultipleChoiceCard from "../components/survey/MultipleChoiceSurveyComponent";
import TeamCard from '../components/survey/TeamSurveyComponent';
import { QuestionReturnDTO } from "../util/api/config/dto";
import { getAnswer, getCurrentQuestions } from "../util/service/surveyService";
import { getTournamentOpen } from "../util/service/teamRegisterService";
import { QuestionType } from "../util/service/util";
import './Survey.css';

const Survey: React.FC = () => {
    const [currentQuestions, setCurrentQuestions] = useState<QuestionReturnDTO[]>([]);
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    const history = useHistory();
    const location = useLocation();


    const getQuestions = async () => {
        const questions = getCurrentQuestions();

        questions.then(async (questions) => {
            const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
                const answers = await getAnswer(question.questionText + question.id);
                return {
                    ...question,
                    isAnswered: (answers !== -1 && question.questionType !== QuestionType.FREE_TEXT),
                }
            }));
            questionsWithAnswers.sort((a, b) => {
                if (a.active !== b.active) {
                    return a.active ? -1 : 1;
                }

                if (a.isAnswered !== b.isAnswered) {
                    return a.isAnswered ? 1 : -1;
                }

                if (a.questionType === QuestionType.FREE_TEXT && b.questionType !== QuestionType.FREE_TEXT) {
                    return a.isAnswered ? 1 : 1;
                }
                if (b.questionType === QuestionType.FREE_TEXT && a.questionType !== QuestionType.FREE_TEXT) {
                    return b.isAnswered ? -1 : -1;
                }

                return 0;
            });

            setCurrentQuestions(questionsWithAnswers);
        });
    };


    const toggleAccordion = (id: string) => {
        setOpenAccordions([id]);
        setOpenAccordions([])
    }


    useEffect(() => {
        getQuestions();

        const tournamentOpen = getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        })

    }, [location]);

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
                        {currentQuestions.map((question) => (
                            (question.questionType === QuestionType.MULTIPLE_CHOICE) ? (
                                <MultipleChoiceCard
                                    key={question.id}
                                    multipleChoiceQuestion={question}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (question.questionType === QuestionType.CHECKBOX) ? (
                                <CheckBoxCard
                                    key={question.id}
                                    checkBoxQuestion={question}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (question.questionType === QuestionType.FREE_TEXT) ? (
                                <FreeTextCard
                                    key={question.id}
                                    freeTextQuestion={question}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (question.questionType === QuestionType.TEAM) ? (
                                <TeamCard
                                    key={question.id}
                                    teamQuestion={question}
                                    toggleAccordion={() => toggleAccordion(question.id.toString())}
                                />
                            ) : (
                                <p key={question.id}> Fehler </p>
                            )
                        ))
                        }
                    </IonAccordionGroup>
                ) : (
                    <p>Gerade finden keine Abstimmungen statt.</p>
                )}

            </IonContent>
        </IonPage>
    );
};

export default Survey;
