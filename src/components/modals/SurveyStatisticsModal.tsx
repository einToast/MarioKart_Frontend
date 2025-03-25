import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import QuestionGraph from '../graph/QuestionGraph';
import Toast from '../Toast';

const SurveyStatisticsModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const [answersCount, setAnswersCount] = useState<number[]>([]);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    console.log(showToast);

    const user = PublicUserService.getUser();

    const getAnswersToQuestion = async () => {
        const questionAnswers = AdminSurveyService.getStatisticsOfQuestion(question.id);

        questionAnswers.then((response) => {
            setAnswersCount(response);
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });
    }

    useEffect(() => {
        if (showModal) getAnswersToQuestion();

    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyResults: false })}>
            <IonContent>
                <h4>{question.questionText}</h4>
                <QuestionGraph question={question} answers={answersCount} />
                <br></br>
                <div className={"playedContainer"}>
                    <IonButton
                        onClick={() => {
                            closeModal({ surveyResults: false });
                            setShowToast(false)
                        }}
                        className={"round"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setShowToast(false);
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

export default SurveyStatisticsModal;
