import { IonButton, IonContent, IonIcon, IonModal, IonToast } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { errorToastColor } from "../../util/api/config/constants";
import { AnswerReturnDTO, QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import { QuestionType } from "../../util/service/util";

const SurveyAnswerModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const [answers, setAnswers] = useState<AnswerReturnDTO[]>([]);
    const [answersCount, setAnswersCount] = useState<number[]>([]);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

    const getAnswersToQuestion = async () => {
        try {
            if (question.questionType === QuestionType.FREE_TEXT) {
                const questionAnswers = await AdminSurveyService.getAnswersOfQuestion(question.id);
                const numberOfAnswers = await AdminSurveyService.getNumberOfAnswers(question.id);
                setAnswers(questionAnswers);
                setTotalAnswers(numberOfAnswers);
            } else {
                const questionAnswers = await AdminSurveyService.getStatisticsOfQuestion(question.id);
                const numberOfAnswers = await AdminSurveyService.getNumberOfAnswers(question.id);
                setAnswersCount(questionAnswers);
                setTotalAnswers(numberOfAnswers);
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    useEffect(() => {
        getAnswersToQuestion();
    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyResults: false })}>
            <IonContent>
                <h4>{question.questionText}</h4>
                <h4>Ergebnisse: {totalAnswers} Antworten</h4>
                {question.questionType !== QuestionType.FREE_TEXT ? (
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
                ) : (
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
                )}
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
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonModal>

    );
};

export default SurveyAnswerModal;
