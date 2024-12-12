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

const MultipleChoiceCard: React.FC<{ multipleChoiceQuestion: QuestionReturnDTO, isOpen: boolean, toggleAccordion: () => void }> = ({ multipleChoiceQuestion, isOpen, toggleAccordion }) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [votedId, setVotedId] = useState<number>(-1);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);

    const user = getUser();

    useEffect(() => {
        getVote();
        if (!multipleChoiceQuestion.active) {
            showResults();
        }
    }, []);

    const getVote = async () => {
        const vote = await getAnswer(multipleChoiceQuestion.questionText + multipleChoiceQuestion.id);

        if (vote !== -1) {
            setVotedId(vote.answerId);
        }
    }

    const handleSaveVote = async (index: number) => {
        try {
            const vote = await registerAnswer(multipleChoiceQuestion, index);
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
        if (!multipleChoiceQuestion.active) {
            const answers = await getAnswers(multipleChoiceQuestion.id);
            const results = new Array(multipleChoiceQuestion.options.length).fill(0);
            answers.forEach(answer => {
                results[answer.multipleChoiceSelectedOption]++;
            });
            setResults(results);
            console.log(results);
        }

    }

    return (
        <IonAccordion value={multipleChoiceQuestion.id.toString()} onIonChange={toggleAccordion} isOpen={isOpen}>
            <IonItem slot="header" color="light" disabled={votedId !== -1 || !multipleChoiceQuestion.active} onClick={showResults}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             showResults();
                         }
                     }}
            >
                <h3 className="weiss">{multipleChoiceQuestion.questionText}</h3>
                {/*{timestamp !== -1 ? `${new Date(timestamp).getHours()}:${new Date(timestamp).getMinutes()}` : ''}*/}
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        multipleChoiceQuestion.options.map((option, index) => {
                            return (
                                <IonButton slot="start" shape="round"
                                           className={!multipleChoiceQuestion.active ? 'bsurvey' : ''}
                                           onClick={votedId === -1 ? () => handleSaveVote(index) : undefined}
                                           tabIndex={0}
                                           onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                  if (votedId === -1) {
                                                      handleSaveVote(index);
                                                  }
                                              }
                                           }}
                                           key={index}
                                           disabled={votedId !== -1 && votedId != index}
                                           style={{
                                               pointerEvents: (votedId !== -1 || !multipleChoiceQuestion.active) ? 'none' : 'auto',
                                               "--gradient-percentage": `${results[index] / Math.max(results.reduce((a, b) => a + b),1) * 100}%`,
                                           }}

                                >
                                    <div className="button-content">
                                        <p>{option}</p>
                                        {!multipleChoiceQuestion.active && <p>{results[index] / Math.max(results.reduce((a, b) => a + b),1) * 100}%</p>}

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

export default React.memo(MultipleChoiceCard);
