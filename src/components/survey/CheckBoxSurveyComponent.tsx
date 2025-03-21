import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem,
} from "@ionic/react";
import {
    checkmarkCircleOutline,
    megaphoneOutline,
    statsChartOutline
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import "../../pages/admin/Points.css";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { PublicSurveyService, PublicUserService } from "../../util/service";
import Toast from '../Toast';

const CheckBoxSurveyComponent: React.FC<{ checkBoxQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ checkBoxQuestion, toggleAccordion }) => {
    const [votes, setVotes] = useState<number[]>([]);
    const [votedId, setVotedId] = useState<number[]>([-1]);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [indicator, setIndicator] = useState<string>('');

    const user = PublicUserService.getUser();

    useEffect(() => {
        getVote();
        if (!checkBoxQuestion.active) {
            showResults();
        }
    }, []);

    const getVote = async () => {
        const vote = await PublicSurveyService.getAnswerCookie(checkBoxQuestion.questionText + checkBoxQuestion.id);

        if (vote !== -1) {
            if (typeof vote.answerId === 'string' && vote.answerId.includes(',')) {
                setVotedId(vote.answerId.split(',').map(Number));
            } else {
                setVotedId([parseInt(vote.answerId)]);
            }
            handleVoteStatus(vote.answerId);
        } else {
            handleVoteStatus(-1);
        }
    }

    const handleSaveVote = async () => {
        try {
            const vote = await PublicSurveyService.submitAnswer(checkBoxQuestion, votes, user?.teamId || -1);
            if (vote) {
                getVote();
                toggleAccordion();
            } else {
                throw new TypeError('Vote konnte nicht gespeichert werden');
            }
        } catch (error) {
            setError(error.message);
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

    const handleVoteStatus = (vote: string | number) => {
        if (!checkBoxQuestion.active) {
            setIndicator(statsChartOutline)
        } else if (vote === undefined || vote === -1) {
            setIndicator(megaphoneOutline)
        } else {
            setIndicator(checkmarkCircleOutline)
        }
    }

    const showResults = async () => {
        if (!checkBoxQuestion.active) {
            const results = await PublicSurveyService.getStatisticsOfQuestion(checkBoxQuestion.id);
            setResults(results);
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
                                        "--gradient-percentage": `${results[index] / Math.max(results.reduce((a, b) => a + b), 1) * 100}%`,
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonAccordion>
    );
};

export default React.memo(CheckBoxSurveyComponent);
