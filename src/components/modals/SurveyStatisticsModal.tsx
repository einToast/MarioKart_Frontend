import { IonButton, IonContent, IonIcon, IonModal, IonToast } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { errorToastColor } from "../../util/api/config/constants";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import QuestionGraph from '../graph/QuestionGraph';

const SurveyStatisticsModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
    const [answersCount, setAnswersCount] = useState<number[]>([]);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

    const getAnswersToQuestion = async () => {
        const questionAnswers = AdminSurveyService.getStatisticsOfQuestion(question.id);

        // TODO: everywhere async .then instead of await with try/catch
        questionAnswers.then((response) => {
            setAnswersCount(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    useEffect(() => {
        getAnswersToQuestion();
    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyResults: false })}>
            <IonContent>
                <h4>{question.questionText}</h4>
                <QuestionGraph question={question} answers={answersCount} />
                <br></br>
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

export default SurveyStatisticsModal;
