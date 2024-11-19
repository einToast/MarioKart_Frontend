import React, { useState } from "react";
import {
    IonAccordion,
    IonButton,
    IonIcon,
    IonItem, IonToast
} from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";
import {GameReturnDTO, PointsReturnDTO, QuestionReturnDTO} from "../../util/api/config/dto";
import { convertUmlauts } from "../../util/service/util";
import "../../pages/admin/Points.css";
import {saveGame} from "../../util/service/adminService";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";

const CheckBoxCard: React.FC<{ checkboxQuestion: QuestionReturnDTO, isOpen: boolean, toggleAccordion: () => void }> = ({ checkboxQuestion, isOpen, toggleAccordion }) => {
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();

    const handleChangePoints = (points: PointsReturnDTO, event: any, index: number) => {
        const newValue = parseInt(event.target.value);
        points.points = newValue; // Update the points object directly
    };

    // const handleSavePoints = async () => {
    //     try {
    //         const newPoints = await saveGame(roundId, game);
    //         if (newPoints) {
    //             setError('Spiel erfolgreich gespeichert');
    //             setToastColor(successToastColor)
    //             setShowToast(true);
    //         } else {
    //             throw new TypeError('Spiel konnte nicht gespeichert werden');
    //         }
    //     } catch (error) {
    //         setError(error.message);
    //         setToastColor(errorToastColor);
    //         setShowToast(true);
    //     }
    //
    // }

    return (
        <IonAccordion value={checkboxQuestion.id.toString()} onIonChange={toggleAccordion} isOpen={isOpen}>
            <IonItem slot="header" color="light">
                <h3 className="weiss">{checkboxQuestion.questionText}</h3>
            </IonItem>

            <div className="ion-padding" slot="content">
                <div className={"inputContainer"}>
                    {
                        checkboxQuestion.options.map((option, index) => {
                            return (
                                <IonItem key={index}>
                                    <IonButton slot="start" shape="round" >
                                        <div>
                                            <p>{option}</p>
                                        </div>
                                    </IonButton>
                                </IonItem>
                            )
                        })
                    }
                </div>
                <IonButton slot="start" shape="round" >
                    <div>
                        <p>Abstimmung speichern</p>
                        <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                    </div>
                </IonButton>
            </div>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonAccordion>
    );
};

export default React.memo(CheckBoxCard);
