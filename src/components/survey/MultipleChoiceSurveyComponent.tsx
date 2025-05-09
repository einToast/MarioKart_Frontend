import { IonAccordion, IonButton, IonIcon, IonItem, } from "@ionic/react";
import { checkmarkCircleOutline, megaphoneOutline, statsChartOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import "../../pages/admin/Points.css";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { User } from "../../util/api/config/interfaces";
import { PublicCookiesService, PublicSurveyService } from "../../util/service";
import Toast from '../Toast';

const MultipleChoiceSurveyComponent: React.FC<{ multipleChoiceQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ multipleChoiceQuestion, toggleAccordion }) => {
    const [vote, setVote] = useState<number>(-1);
    const [votedId, setVotedId] = useState<number>(-1);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);

    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [indicator, setIndicator] = useState<string>('');

    const getVote = async () => {
        const voted = await PublicSurveyService.getAnswerCookie(multipleChoiceQuestion.questionText + multipleChoiceQuestion.id);

        if (voted !== -1) {
            setVotedId(parseInt(voted.answerId));
            handleVoteStatus(voted.answerId);
        } else {
            handleVoteStatus(-1);
        }

    }

    const handleSaveVote = () => {
        PublicSurveyService.submitAnswer(multipleChoiceQuestion, vote, user?.teamId || -1)
            .then(savedVote => {
                if (savedVote) {
                    getVote();
                    toggleAccordion();
                } else {
                    setError('Vote konnte nicht gespeichert werden');
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }

    const handleVoteStatus = (vote: string | number) => {
        if (!multipleChoiceQuestion.active) {
            setIndicator(statsChartOutline)
        } else if (vote === undefined || vote === -1) {
            setIndicator(megaphoneOutline)
        } else {
            setIndicator(checkmarkCircleOutline)
        }
    }

    const showResults = async () => {
        if (!multipleChoiceQuestion.active) {
            const results = await PublicSurveyService.getStatisticsOfQuestion(multipleChoiceQuestion.id);
            setResults(results);
        }
    }

    useEffect(() => {
        setUser(PublicCookiesService.getUser());

        getVote();
        if (!multipleChoiceQuestion.active) {
            showResults();
        }
    }, []);

    return (
        <IonAccordion value={multipleChoiceQuestion.id.toString()} >
            <IonItem slot="header" color="light" disabled={votedId !== -1 || !multipleChoiceQuestion.active} onClick={showResults}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        showResults();
                    }
                }}
            >
                <IonIcon icon={indicator} slot="end" />
                <h3 className="weiss">{multipleChoiceQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        multipleChoiceQuestion.options.map((option, index: number) => {
                            return (
                                <IonButton slot="start" shape="round"
                                    className={!multipleChoiceQuestion.active ? 'bsurvey' : ''}
                                    onClick={votedId === -1 ? () => setVote(index) : undefined}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            if (votedId === -1) {
                                                setVote(index);
                                            }
                                        }
                                    }}
                                    key={index}
                                    disabled={!(vote == index || votedId == index) && votedId !== -1}
                                    style={{
                                        pointerEvents: (votedId !== -1 || !multipleChoiceQuestion.active) ? 'none' : 'auto',
                                        opacity: vote == index || votedId == index ? 1 : 0.5,
                                        "--gradient-percentage": `${results[index] / Math.max(results.reduce((a, b) => a + b), 1) * 100}%`,
                                    }}

                                >
                                    <div className="button-content">
                                        <p>{option}</p>
                                        {!multipleChoiceQuestion.active && (
                                            <p>{Math.round((results[index] / Math.max(results.reduce((a, b) => a + b), 1)) * 100)}%</p>
                                        )}

                                    </div>
                                </IonButton>)
                        })
                    }
                </div>
                {multipleChoiceQuestion.active && votedId === -1 && (
                    <IonButton
                        className={"button"}
                        onClick={() => handleSaveVote()}
                        disabled={!(votedId === -1) || !multipleChoiceQuestion.active || vote === -1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleSaveVote();
                            }
                        }}
                    >
                        Antwort speichern
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

export default React.memo(MultipleChoiceSurveyComponent);
