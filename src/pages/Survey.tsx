import { IonAccordionGroup, IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import CheckBoxCard from "../components/survey/CheckBoxSurveyComponent";
import FreeTextCard from "../components/survey/FreeTextSurveyComponent";
import MultipleChoiceCard from "../components/survey/MultipleChoiceSurveyComponent";
import TeamCard from '../components/survey/TeamSurveyComponent';
import Toast from '../components/Toast';
import { useWebSocketConnection } from '../hooks/useWebSocketConnection';
import { QuestionReturnDTO } from "../util/api/config/dto";
import { ShowTab2Props } from '../util/api/config/interfaces';
import { PublicScheduleService, PublicSettingsService, PublicSurveyService } from '../util/service';
import { QuestionType } from "../util/service/util";
import './Survey.css';

const Survey: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {
    const [currentQuestions, setCurrentQuestions] = useState<QuestionReturnDTO[]>([]);
    const accordionGroupRef = useRef<null | HTMLIonAccordionGroupElement>(null);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const history = useHistory();
    const location = useLocation();


    const getQuestions = () => {
        return PublicSurveyService.getVisibleQuestions()
            .then(async questions => {
                const questionsWithAnswers = await Promise.all(
                    questions.map(question =>
                        PublicSurveyService.getAnswerCookie(question.questionText + question.id)
                            .then(answers => ({
                                ...question,
                                isAnswered: (answers !== -1 && question.questionType !== QuestionType.FREE_TEXT)
                            }))
                    )
                );

                questionsWithAnswers.sort((a, b) => {
                    if (a.active !== b.active) return a.active ? -1 : 1;
                    if (a.isAnswered !== b.isAnswered) return a.isAnswered ? 1 : -1;
                    if (a.questionType === QuestionType.FREE_TEXT && b.questionType !== QuestionType.FREE_TEXT) return 1;
                    if (b.questionType === QuestionType.FREE_TEXT && a.questionType !== QuestionType.FREE_TEXT) return -1;
                    return 0;
                });

                setCurrentQuestions(questionsWithAnswers);
                return questionsWithAnswers;
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
                throw error;
            });
    };

    const updateShowTab2 = () => {
        Promise.all([
            PublicScheduleService.isScheduleCreated(),
            PublicScheduleService.isFinalScheduleCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([scheduleValue, finalScheduleValue, roundsLessTwoValue]) => {
            props.setShowTab2(!scheduleValue || finalScheduleValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const toggleAccordion = (id: string) => {
        setOpenAccordions([id]);
        setOpenAccordions([])
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            getQuestions();
            updateShowTab2();
            event.detail.complete();
        }, 500);
    };

    const isConnected = useWebSocketConnection('/topic/rounds', getQuestions);


    useEffect(() => {

        Promise.all([
            getQuestions(),
            updateShowTab2(),
            PublicSettingsService.getTournamentOpen()
        ])
            .then(([_, __, tournamentOpen]) => {
                if (!tournamentOpen) {
                    history.push('/admin');
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }, [location]);

    return (
        <IonPage>
            <Header />
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent refreshingSpinner="circles" />
                </IonRefresher>
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonPage>
    );
};

export default Survey;
