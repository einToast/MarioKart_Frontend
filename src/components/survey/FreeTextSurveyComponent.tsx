import {
    IonAccordion,
    IonButton, IonIcon,
    IonItem, IonToast
} from "@ionic/react";
import { megaphoneOutline, statsChartOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import "../../pages/admin/Points.css";
import '../../pages/Survey.css';
import { errorToastColor } from "../../util/api/config/constants";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { PublicSurveyService, PublicUserService } from "../../util/service";

const FreeTextSurveyComponent: React.FC<{ freeTextQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ freeTextQuestion: freeTextQuestion, toggleAccordion }) => {

    const [text, setText] = useState<string>('');
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [indicator, setIndicator] = useState<string>('');

    const user = PublicUserService.getUser();


    const handleSaveVote = async () => {
        try {
            const vote = await PublicSurveyService.submitAnswer(freeTextQuestion, text, user?.teamId || -1);
            if (vote) {
                setText('');
                toggleAccordion();
            } else {
                throw new TypeError('Vote konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleVoteStatus = () => {
        if (!freeTextQuestion.active) {
            setIndicator(statsChartOutline)
        } else {
            setIndicator(megaphoneOutline)
        }
    }

    useEffect(() => {
        handleVoteStatus();
    }, []);

    return (
        <IonAccordion value={freeTextQuestion.id.toString()}>

            <IonItem slot="header" color="light" disabled={!freeTextQuestion.active} className={"accordion-button"}>
                <IonIcon icon={indicator} slot="end" />
                <h3 className="weiss">{freeTextQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div>
                    <textarea
                        className={"input"}
                        placeholder={!freeTextQuestion.active ? "Umfrage geschlossen" : "Dein Feedback"}
                        style={{ height: "200px", width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px" }}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={!freeTextQuestion.active}
                    />
                </div>
                {freeTextQuestion.active && (
                    <IonButton
                        className={"button"}
                        onClick={() => handleSaveVote()}
                        disabled={!freeTextQuestion.active}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSaveVote();
                            }
                        }}
                    >
                        Speichern
                    </IonButton>
                )}
            </div>
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
        </IonAccordion>
    );
};

export default React.memo(FreeTextSurveyComponent);
