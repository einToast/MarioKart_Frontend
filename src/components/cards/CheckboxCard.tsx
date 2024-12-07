import React, {useEffect, useState} from "react";
import {
    IonAccordion,
    IonButton,
    IonItem, IonToast
} from "@ionic/react";
import {QuestionReturnDTO} from "../../util/api/config/dto";
import "../../pages/admin/Points.css";
import {getUser} from "../../util/service/loginService";
import {errorToastColor} from "../../util/api/config/constants";
import {getAnswer, getAnswers, registerAnswer} from "../../util/service/surveyService";

const CheckBoxCard: React.FC<{ checkboxQuestion: QuestionReturnDTO, isOpen: boolean, toggleAccordion: () => void }> = ({ checkboxQuestion, isOpen, toggleAccordion }) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [votedId, setVotedId] = useState<number>(-1);
    // const [timestamp, setTimestamp] = useState<number>(-1);
    const [results, setResults] = useState<number[]>([]);

    const user = getUser();

    useEffect(() => {
        getVote();
    }, []);

    const getVote = async () => {
        const vote = await getAnswer(checkboxQuestion.questionText + checkboxQuestion.id);

        if (vote !== -1) {
            setVotedId(vote.answerId);
            // setTimestamp(vote.timestamp);
            console.log(vote.timestamp);
        }
    }

    const handleSaveVote = async (index: number) => {
        try {
            const vote = await registerAnswer(checkboxQuestion, index);
            if (vote) {
                // setError('Vote erfolgreich gespeichert');
                // setToastColor(successToastColor)
                // setShowToast(true);
                getVote();
            } else {
                throw new TypeError('Vote konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const showResults = async () => {
        if (!checkboxQuestion.active) {
            const answers = await getAnswers(checkboxQuestion.id);
            const results = new Array(checkboxQuestion.options.length).fill(0);
            answers.forEach(answer => {
                answer.checkboxSelectedOptions.forEach(option => {
                    results[option]++;
                })
            });
            setResults(results);
            console.log(results);
        }

    }

    return (
        <IonAccordion value={checkboxQuestion.id.toString()} onIonChange={toggleAccordion} isOpen={isOpen}>
            <IonItem slot="header" color="light" disabled={votedId !== -1}>
                <h3 className="weiss">{checkboxQuestion.questionText}</h3>
                {/*{timestamp !== -1 ? `${new Date(timestamp).getHours()}:${new Date(timestamp).getMinutes()}` : ''}*/}
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        checkboxQuestion.options.map((option, index) => {
                            return (
                                <IonButton slot="start" shape="round" //className="bsurvey"
                                           onClick={votedId === -1 ? () => handleSaveVote(index) : undefined}
                                           tabIndex={0}
                                           onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                handleSaveVote(index);
                                              }
                                           }}
                                           key={index}
                                           disabled={votedId !== -1 && votedId != index}
                                           style={{
                                               pointerEvents: votedId !== -1 ? 'none' : 'auto',
                                           }}

                                >
                                    <div className="button-content">
                                        <p>{option}</p>
                                        {/*<span className="percentage-fill" style={{ width: `70%` }}></span>*/}
                                        {/*<p>70%</p>*/}
                                    </div>
                                </IonButton>)
                        })
                    }
                </div>
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

export default React.memo(CheckBoxCard);
