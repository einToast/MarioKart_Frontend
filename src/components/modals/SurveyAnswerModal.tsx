import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { AnswerReturnDTO, QuestionReturnDTO, TeamReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService, AdminSurveyService, PublicRegistrationService } from '../../util/service';
import { QuestionType } from "../../util/service/util";
import Toast from '../Toast';

const SurveyAnswerModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const [answers, setAnswers] = useState<AnswerReturnDTO[]>([]);
    const [answersCount, setAnswersCount] = useState<number[]>([]);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const getAnswersToQuestion = () => {
        if (question.questionType === QuestionType.FREE_TEXT || question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) {
            Promise.all([
                AdminSurveyService.getAnswersOfQuestion(question.id),
                AdminSurveyService.getNumberOfAnswers(question.id)
            ])
                .then(([answers, total]) => {
                    setAnswers(answers);
                    setTotalAnswers(total);
                })
                .catch(error => {
                    setError(error.message);
                    setShowToast(true);
                });
        } else {
            Promise.all([
                AdminSurveyService.getStatisticsOfQuestion(question.id),
                AdminSurveyService.getNumberOfAnswers(question.id)
            ])
                .then(([statistics, total]) => {
                    setAnswersCount(statistics);
                    setTotalAnswers(total);
                })
                .catch(error => {
                    setError(error.message);
                    setShowToast(true);
                });
        }
    };

    const getAllTeams = () => {
        PublicRegistrationService.getTeams()
            .then(fetchedTeams => {
                setTeams(fetchedTeams);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    useEffect(() => {
        if (showModal) getAnswersToQuestion();
        if (question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) {
            getAllTeams();
        }
    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyResults: false })}>
            <IonContent>
                <h4>{question.questionText}</h4>
                <h4>Ergebnisse: {totalAnswers} Antworten</h4>
                {question.questionType !== QuestionType.FREE_TEXT && question.questionType !== QuestionType.TEAM_ONE_FREE_TEXT ? (
                    <>

                        <div className={"allTeamResult"} style={{ marginBottom: '50px' }}>
                            <ul>
                                {
                                    question.options.map((option, index) => (
                                        <li key={option}> {option}: {answersCount[index]} </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </>
                ) : ( question.questionType === QuestionType.FREE_TEXT ? (
                    <>
                        <div className={"allTeamResult"} style={{ marginBottom: '50px' }}>
                            <ul>
                                {
                                    answers.map((answer, index) => (
                                        <li key={index}> {answer.freeTextAnswer} </li>
                                    ))

                                }
                            </ul>
                        </div>
                    </>
                ) : ( question.questionType === QuestionType.TEAM_ONE_FREE_TEXT ? (
                    <>
                        <div className={"allTeamResult"} style={{ marginBottom: '50px' }}>
                            <ul>
                                {
                                    answers.map((answer, index) => (
                                        <li key={index}> {teams.find(team => team.id === answer.teamSelectedOption)?.teamName}: {answer.freeTextAnswer} </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </>
                ) : null ))}
                <div className={"playedContainer"}>
                    <IonButton onClick={() => closeModal({ surveyResults: false })} className={"round"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ surveyResults: false });
                            }
                        }}
                    >
                        <div>
                            <p>Ergebnisse schließen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>

    );
};

export default SurveyAnswerModal;
