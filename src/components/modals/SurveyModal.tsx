import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import { SurveyModalResult} from "../../util/api/config/interfaces";
import "../../pages/admin/SurveyAdmin.css";
import { errorToastColor } from "../../util/api/config/constants";
import { AnswerReturnDTO, QuestionReturnDTO } from "../../util/api/config/dto";
import { getUser } from "../../util/service/loginService";
import { getAnswers } from "../../util/service/surveyService";
import { QuestionType } from "../../util/service/util";

const SurveyModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const [answers, setAnswers] = useState<AnswerReturnDTO[]>([]);
    const [answersCount, setAnswersCount] = useState<number[]>([]);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const getAnswersToQuestion = async () => {
        try {
            const questionAnswers = await getAnswers(question.id);
            if (questionAnswers) {
                countAnswers(questionAnswers);
            } else {
                throw new TypeError('Antworten konnten nicht geladen werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const countAnswers = (answers: AnswerReturnDTO[]) => {
        if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
            const count = new Array(question.options.length).fill(0);
            answers.forEach(answer => {
                count[answer.multipleChoiceSelectedOption]++;
            });
            setAnswersCount(count);
        } else if (question.questionType === QuestionType.FREE_TEXT) {
            setAnswers(answers);
            setAnswersCount([answers.length]);
        } else if (question.questionType === QuestionType.CHECKBOX) {
            const count = new Array(question.options.length).fill(0);
            answers.forEach(answer => {
                answer.checkboxSelectedOptions.forEach(option => {
                    count[option]++;
                });
            });
            setAnswersCount(count);
        } else if (question.questionType === QuestionType.TEAM) {
            const count = new Array(question.options.length).fill(0);
            answers.forEach(answer => {
                count[answer.teamSelectedOption]++;
            });
            setAnswersCount(count);
        }
        setTotalAnswers(answers.length);
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
        </IonModal>

    );
};

export default SurveyModal;
