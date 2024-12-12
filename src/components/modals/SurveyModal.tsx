import React, {useEffect, useState} from 'react';
import {IonButton, IonContent, IonIcon, IonItem, IonModal, IonSelect, IonSelectOption, IonToast} from '@ionic/react';
import axios from "axios";
import "../../pages/admin/SurveyAdmin.css";
import "../../interface/interfaces"
import {arrowForwardOutline} from "ionicons/icons";
import {getAnswers, submitQuestion} from "../../util/service/surveyService";
import {QuestionType} from "../../util/service/util";
import {i} from "vite/dist/node/types.d-aGj9QkWt";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import results from "../../pages/admin/Results";
import SurveyAddModal from "./SurveyAddModal";
import {AnswerReturnDTO, QuestionReturnDTO} from "../../util/api/config/dto";

const SurveyModal = ({ showModal, closeModal, question }) => {
    const [answers, setAnswers] = useState<AnswerReturnDTO[]>([]);
    const [answersCount, setAnswersCount] = useState<number[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const getAnswersToQuestion = async () => {
        try {
            const questionAnswers = await getAnswers(question.id);
            if (questionAnswers) {
                console.log(questionAnswers);
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
        }
    }

    useEffect(() => {
        getAnswersToQuestion();
    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <h4>{question.questionText}</h4>
                {question.questionType !== QuestionType.FREE_TEXT ? (
                    <>
                        <h4>Ergebnisse:</h4>
                        <div className={"allTeamResult"} style={{marginBottom: '50px'}}>
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
                        <h4>Ergebnisse:</h4>
                        <div className={"allTeamResult"} style={{marginBottom: '50px'}}>
                            <ul>
                                {
                                    answers.map((answer, index) => (
                                        <li key={index}> {answer.freeTextAnswer} </li>
                                    ))

                                }
                                {console.log(answers)}
                            </ul>
                        </div>
                    </>
                )}
                <div className={"playedContainer"}>
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
                </div>
            </IonContent>
        </IonModal>

);
};

export default SurveyModal;
