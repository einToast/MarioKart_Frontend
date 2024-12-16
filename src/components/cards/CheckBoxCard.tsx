import React, {useEffect, useState} from "react";
import {
    IonAccordion,
    IonButton, IonIcon,
    IonItem, IonToast
} from "@ionic/react";
import {QuestionReturnDTO} from "../../util/api/config/dto";
import "../../pages/admin/Points.css";
import {getUser} from "../../util/service/loginService";
import {errorToastColor} from "../../util/api/config/constants";
import {getAnswer, getAnswers, registerAnswer} from "../../util/service/surveyService";
import {set} from "js-cookie";
import {megaphoneOutline, statsChartOutline, thumbsUpOutline} from "ionicons/icons";

const CheckBoxCard: React.FC<{ checkBoxQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ checkBoxQuestion,toggleAccordion }) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [votes, setVotes] = useState<number[]>([]);
    const [votedId, setVotedId] = useState<number[]>([-1]);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);
    const [indicator, setIndicator] = useState<string>('');

    const user = getUser();

    useEffect(() => {
        getVote();
        if (!checkBoxQuestion.active) {
            showResults();
        }
    }, []);

    const getVote = async () => {
        const vote = await getAnswer(checkBoxQuestion.questionText + checkBoxQuestion.id);

        if (vote !== -1) {
            if (typeof vote.answerId === 'string' && vote.answerId.includes(',')) {
                setVotedId(vote.answerId.split(',').map(Number));
            } else {
                setVotedId([vote]);
            }
        }
        handleVoteStatus(vote.answerId);
    }

    const handleSaveVote = async () => {
        try {
            const vote = await registerAnswer(checkBoxQuestion, votes);
            if (vote) {
                getVote();
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

    const handleAddVote = async (index: number) => {
        if (votes.includes(index)) {
            setVotes(votes.filter(vote => vote !== index));
        } else {
            setVotes([...votes, index]);
        }
    }

    const handleVoteStatus = (vote:number[]) => {
        if (!checkBoxQuestion.active) {
            setIndicator(statsChartOutline)
        } else if (vote === undefined) {
            setIndicator(megaphoneOutline)
        } else {
            setIndicator(thumbsUpOutline)
        }
    }

    const showResults = async () => {
        if (!checkBoxQuestion.active) {
            const answers = await getAnswers(checkBoxQuestion.id);
            const results = new Array(checkBoxQuestion.options.length).fill(0);
            answers.forEach(answer => {
                answer.checkboxSelectedOptions.forEach(option => {
                    results[option]++;
                });
            });
            setResults(results);
            console.log(results);
        }

    }

    return (
        <IonAccordion value={checkBoxQuestion.id.toString()}>
            <IonItem slot="header" color="light" disabled={!votedId.includes(-1) || !checkBoxQuestion.active} onClick={showResults}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             showResults();
                         }
                     }}
            >
                <IonIcon icon={indicator} slot="end" />
                <h3 className="weiss">{checkBoxQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        checkBoxQuestion.options.map((option, index) => {
                            return (
                                <IonButton slot="start" shape="round"
                                           className={!checkBoxQuestion.active ? 'bsurvey' : ''}
                                           onClick={votedId.includes(-1) ? () => handleAddVote(index) : undefined}
                                           tabIndex={0}
                                           onKeyDown={(e) => {
                                               if (e.key === 'Enter' || e.key === ' ') {
                                                   if (votedId.includes(-1)) {
                                                       handleAddVote(index);
                                                   }
                                               }
                                           }}
                                           key={index}

                                           disabled={!(votes.includes(index) || votedId.includes(index)) && !votedId.includes(-1)}
                                           style={{
                                               pointerEvents: (!votedId.includes(-1) || !checkBoxQuestion.active) ? 'none' : 'auto',
                                               opacity: votes.includes(index) || votedId.includes(index) ? 1 : 0.5,
                                               "--gradient-percentage": `${results[index] / Math.max(results.reduce((a, b) => a + b),1) * 100}%`,
                                           }}
                                >
                                    <div className="button-content">
                                        <p>{option}</p>
                                        {!checkBoxQuestion.active && (
                                            <p>{Math.round((results[index] / Math.max(results.reduce((a, b) => a + b), 1)) * 100)}%</p>
                                        )}

                                    </div>
                                </IonButton>)
                        })
                    }
                </div>
                {checkBoxQuestion.active && votedId.includes(-1) && (
                    <IonButton
                        className={"button"}
                        onClick={() => handleSaveVote()}
                        disabled={!votedId.includes(-1) || !checkBoxQuestion.active || votes.length === 0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSaveVote();
                            }
                        }}
                    >
                        Antworten speichern
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

export default React.memo(CheckBoxCard);
