import { IonAccordion, IonButton, IonIcon, IonItem, } from "@ionic/react";
import { checkmarkCircleOutline, megaphoneOutline, statsChartOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import "../../pages/admin/Points.css";
import '../../pages/Survey.css';
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { User } from "../../util/api/config/interfaces";
import { PublicCookiesService, PublicSurveyService } from "../../util/service";
import Toast from '../Toast';

const TeamOneFreeTextSurveyComponent: React.FC<{ teamOneFreeTextQuestion: QuestionReturnDTO, toggleAccordion: () => void }> = ({ teamOneFreeTextQuestion, toggleAccordion }) => {
    const [vote, setVote] = useState<number>(-1);
    const [votedId, setVotedId] = useState<number>(-1);

    const [text, setText] = useState<string>('');

    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [indicator, setIndicator] = useState<string>('');

    const getVote = async () => {
        const voted = await PublicSurveyService.getAnswerCookie(teamOneFreeTextQuestion.questionText + teamOneFreeTextQuestion.id);
        if (voted !== -1) {
            setVotedId(parseInt(voted.answerId));
            handleVoteStatus(voted.answerId);
        } else {
            handleVoteStatus(-1);
        }
    }


    const handleSaveVote = () => {
        PublicSurveyService.submitAnswer(teamOneFreeTextQuestion, text, user?.teamId || -1)
            .then(savedVote => {
                if (savedVote) {
                    setText('');
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
    };

    const handleVoteStatus = (vote: string | number) => {
        if (!teamOneFreeTextQuestion.active) {
            setIndicator(statsChartOutline)
        } else if (vote === undefined || vote === -1) {
            setIndicator(megaphoneOutline)
        } else {
            setIndicator(checkmarkCircleOutline)
        }
    }

    useEffect(() => {
        setUser(PublicCookiesService.getUser());

        getVote();
    }, []);

    return (
        <IonAccordion value={teamOneFreeTextQuestion.id.toString()}>

            <IonItem slot="header" color="light" disabled={!teamOneFreeTextQuestion.active || votedId !== -1} className={"accordion-button"}>
                <IonIcon icon={indicator} slot="end" />
                <h3 className="weiss">{teamOneFreeTextQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div>
                    <textarea
                        className={"input"}
                        placeholder={!teamOneFreeTextQuestion.active ? "Umfrage geschlossen" : "Deine Team-Antwort (nur ein Eintrag pro Team möglich)"}
                        style={{ height: "200px", width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px" }}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={!teamOneFreeTextQuestion.active || votedId !== -1}
                    />
                </div>
                {teamOneFreeTextQuestion.active && votedId === -1 && (
                    <IonButton
                        className={"button"}
                        onClick={() => handleSaveVote()}
                        disabled={!teamOneFreeTextQuestion.active}
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonAccordion>
    );
};

export default React.memo(TeamOneFreeTextSurveyComponent);
