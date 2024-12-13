import React, {useEffect, useState} from "react";
import {
    IonAccordion,
    IonButton,
    IonItem, IonToast
} from "@ionic/react";
import {QuestionReturnDTO} from "../../util/api/config/dto";
import "../../pages/admin/Points.css";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import {getAnswer, getAnswers, registerAnswer} from "../../util/service/surveyService";

const FreeTextCard: React.FC<{ freeTextQuestion: QuestionReturnDTO, isOpen: boolean, toggleAccordion: () => void }> = ({ freeTextQuestion: freeTextQuestion, isOpen, toggleAccordion }) => {

    const [text, setText] = useState<string>('');
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [votedId, setVotedId] = useState<number>(-1);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);

    const user = getUser();

    useEffect(() => {
        getVote();
    }, []);

    const getVote = async () => {
        const vote = await getAnswer(freeTextQuestion.questionText + freeTextQuestion.id);

        if (vote !== -1) {
            setVotedId(vote.answerId);
        }
    }

    const handleSaveVote = async () => {
        try {
            const vote = await registerAnswer(freeTextQuestion, text);
            if (vote) {
                getVote();
                setText('');
            } else {
                throw new TypeError('Vote konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    return (
        <IonAccordion value={freeTextQuestion.id.toString()} onIonChange={toggleAccordion} isOpen={isOpen}>
            <IonItem slot="header" color="light" disabled={!freeTextQuestion.active}>
                <h3 className="weiss">{freeTextQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div>
                    <textarea
                        className={"input"}
                        placeholder={!freeTextQuestion.active ? "Umfrage geschlossen" : "Dein Feedback"}
                        style={{height: "200px", width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px"}}
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

export default React.memo(FreeTextCard);
