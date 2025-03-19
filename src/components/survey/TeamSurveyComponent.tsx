import {
    IonAccordion,
    IonButton, IonIcon,
    IonItem, IonToast
} from "@ionic/react";
import {
    checkmarkCircleOutline,
    megaphoneOutline,
    statsChartOutline
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import "../../pages/admin/Points.css";
import { errorToastColor } from "../../util/api/config/constants";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { PublicSurveyService, PublicUserService } from "../../util/service";


const TeamSurveyComponent: React.FC<{ teamQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ teamQuestion, toggleAccordion }) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [vote, setVote] = useState<number>(-1);
    const [votedId, setVotedId] = useState<number>(-1);
    const [results, setResults] = useState<number[]>([0, 0, 0, 0]);
    const [indicator, setIndicator] = useState<string>('');

    const user = PublicUserService.getUser();

    const getVote = async () => {
        const voted = await PublicSurveyService.getAnswerCookie(teamQuestion.questionText + teamQuestion.id);

        if (voted !== -1) {
            setVotedId(parseInt(voted.answerId));
            handleVoteStatus(voted.answerId);
        } else {
            handleVoteStatus(-1);
        }

    }

    const handleSaveVote = async () => {
        try {
            const voted = await PublicSurveyService.submitAnswer(teamQuestion, vote, user?.teamId || -1);
            if (voted) {
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

    const handleVoteStatus = (vote: string | number) => {
        if (!teamQuestion.active) {
            setIndicator(statsChartOutline)
        } else if (vote === undefined || vote === -1) {
            setIndicator(megaphoneOutline)
        } else {
            setIndicator(checkmarkCircleOutline)
        }
    }

    const showResults = async () => {
        if (!teamQuestion.active) {
            const results = await PublicSurveyService.getStatisticsOfQuestion(teamQuestion.id);

            setResults(results);
        }
    }

    useEffect(() => {
        getVote();
        if (!teamQuestion.active) {
            showResults();
        }
    }, []);

    return (
        <IonAccordion value={teamQuestion.id.toString()} >
            <IonItem slot="header" color="light" disabled={votedId !== -1 || !teamQuestion.active} onClick={showResults}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        showResults();
                    }
                }}
            >
                <IonIcon icon={indicator} slot="end" />
                <h3 className="weiss">{teamQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        teamQuestion.options.map((option, index: number) => {
                            return (
                                <IonButton slot="start" shape="round"
                                    className={!teamQuestion.active ? 'bsurvey' : ''}
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
                                        pointerEvents: (votedId !== -1 || !teamQuestion.active) ? 'none' : 'auto',
                                        opacity: vote == index || votedId == index ? 1 : 0.5,
                                        "--gradient-percentage": `${results[index] / Math.max(results.reduce((a, b) => a + b), 1) * 100}%`,
                                    }}

                                >
                                    <div className="button-content">
                                        <p>{option}</p>
                                        {!teamQuestion.active && (
                                            <p>{Math.round((results[index] / Math.max(results.reduce((a, b) => a + b), 1)) * 100)}%</p>
                                        )}

                                    </div>
                                </IonButton>)
                        })
                    }
                </div>
                {teamQuestion.active && votedId === -1 && (
                    <IonButton
                        className={"button"}
                        onClick={() => handleSaveVote()}
                        disabled={!(votedId === -1) || !teamQuestion.active || vote === -1}
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

export default React.memo(TeamSurveyComponent);
