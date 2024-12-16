import React, {useEffect, useState} from 'react';
import {IonButton, IonContent, IonIcon, IonItem, IonModal, IonSelect, IonSelectOption, IonToast} from '@ionic/react';
import axios from "axios";
import "../../pages/admin/SurveyAdmin.css";
import "../../interface/interfaces"
import {arrowForwardOutline} from "ionicons/icons";
import {submitQuestion} from "../../util/service/surveyService";
import {QuestionType} from "../../util/service/util";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import {QuestionReturnDTO} from "../../util/api/config/dto";

const SurveyAddModal:React.FC<{ showModal:boolean, closeModal: (survey:Object) => void}> = ({ showModal, closeModal }) => {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const incrementOptions = () => {
        setNumberOfOptions(numberOfOptions + 1);
        setOptions([...options, '']);
    };

    const decrementOptions = () => {
        if (numberOfOptions > 0) {
            setNumberOfOptions(numberOfOptions - 1);
            setOptions(options.slice(0, -1));
        }
    };

    const resetQuestion = () => {
        setQuestionText('');
        setQuestionType(QuestionType.MULTIPLE_CHOICE);
        setOptions(['', '', '', '']);
        setNumberOfOptions(4);
        closeModal({surveyCreated: false});
    }

    const handleSubmit = async () => {
        console.log(questionText, questionType, options);
        try {
            const newQuestion = await submitQuestion(questionText, questionType, options);
            console.log(newQuestion);

            if (newQuestion) {
                resetQuestion();
                closeModal({surveyCreated: true});
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }

    };

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={resetQuestion}>
            <IonContent>
                <h4>Neue Abstimmung</h4>
                <form onSubmit={handleSubmit}>

                    <div className="borderContainer">
                        <p>Frage zur Abstimmung</p>
                        <input
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Frage eingeben"
                            required
                        />
                    </div>

                    <div className="borderContainer multipleSelect">
                        <div>
                            <p>Abstimmungsoptionen</p>
                            <IonItem className={"item-background-color"}>
                                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} style={{cursor: 'pointer'}}>
                                    {
                                        Object.keys(QuestionType).map((key) => (
                                            <option key={key}
                                                    value={key}
                                            >
                                                {key}
                                                {/*{console.log(key typeof QuestionType.MULTIPLE_CHOICE)}*/}
                                            </option>
                                        ))
                                    }
                                </select>
                            </IonItem>
                        </div>
                        {(questionType !== QuestionType.FREE_TEXT) &&
                        <div>
                            <IonButton className="add-option-button"
                                       onClick={incrementOptions}
                                       onKeyDown={(e) => {
                                           if (e.key === 'Enter' || e.key === ' ') {
                                               incrementOptions();
                                           }
                                       }}
                            >
                                <div>
                                    <p>Option hinzufügen</p>
                                </div>
                            </IonButton>
                            <IonButton className="add-option-button secondary"
                                       onClick={decrementOptions}
                                       onKeyDown={(e) => {
                                           if (e.key === 'Enter' || e.key === ' ') {
                                               decrementOptions();
                                           }
                                       }}

                            >
                                 <div>
                                      <p>Option entfernen</p>
                                 </div>
                            </IonButton>
                        </div>
                        }
                    </div>

                    <br></br>
                    {(questionType === QuestionType.CHECKBOX || questionType === QuestionType.MULTIPLE_CHOICE) &&
                        <>
                            {Array.from({length: numberOfOptions}, (_, index) => (
                                <div key={index} className="form-group">
                                    <label>Option {index + 1}</label>
                                    <input
                                        type="text"
                                        value={options[index]}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1} eingeben`}
                                        required
                                    />
                                </div>
                            ))}
                                {/*    add option*/}
                        </>
                    }
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={resetQuestion}
                               tabIndex={0}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ' ') {
                                       resetQuestion();
                                   }
                               }}
                    >
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleSubmit}
                               tabIndex={0}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ' ') {
                                       handleSubmit();
                                   }
                               }}
                    >

                        <div>
                            <p>Umfrage speichern</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
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
        </IonModal>
    );
};

export default SurveyAddModal;
