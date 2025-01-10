import React, {useEffect, useState} from 'react';
import {IonButton, IonContent, IonIcon, IonItem, IonModal, IonSelect, IonSelectOption, IonToast} from '@ionic/react';
import axios from "axios";
import "../../pages/admin/SurveyAdmin.css";
import "../../interface/interfaces"
import {arrowForwardOutline} from "ionicons/icons";
import {changeQuestion, submitQuestion} from "../../util/service/surveyService";
import {QuestionType} from "../../util/service/util";
import {getUser} from "../../util/service/loginService";
import {errorToastColor, successToastColor} from "../../util/api/config/constants";
import SurveyAddModal from "./SurveyAddModal";
import {set} from "js-cookie";
import {QuestionReturnDTO} from "../../util/api/config/dto";

const SurveyChangeModal:React.FC<{ showModal:boolean, closeModal: (survey:Object) => void, question: QuestionReturnDTO}> = ({ showModal, closeModal, question }) => {

    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = getUser();

    const handleQuestionTypeChange = (e) => {
        setQuestionType(e.target.value);
        if (e.target.value === QuestionType.FREE_TEXT) {
            setNumberOfOptions(0);
        } else {
            setNumberOfOptions(options.length);
        }
    }

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
    }

    const handleChange = async () => {
        try {
            question.questionText = questionText;
            question.questionType = questionType;
            question.options = options;
            const newQuestion = await changeQuestion(question);

            if (newQuestion) {
                resetQuestion();
                closeModal({surveyChanged: true});
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }

    };

    useEffect(() => {
        setQuestionText(question.questionText);
        setQuestionType(question.questionType);
        setOptions((question.options) ? question.options : ['']);
        setNumberOfOptions((question.options) ? question.options.length : 0);

    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <h4>Abstimmung</h4>
                <form onSubmit={handleChange}>

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
                                <select value={questionType} onChange={(e) => handleQuestionTypeChange(e)} disabled style={{color: 'grey'}}>
                                    {
                                        Object.keys(QuestionType).map((key) => (
                                            <option key={key}
                                                    value={key}
                                            >
                                                {key}
                                            </option>
                                        ))
                                    }
                                </select>
                            </IonItem>
                        </div>
                        {(questionType !== QuestionType.FREE_TEXT) &&
                                <div>
                                    <IonButton className="add-option-button"
                                               onClick={incrementOptions}>
                                        <div>
                                            <p>Option hinzufügen</p>
                                        </div>
                                    </IonButton>
                                    <IonButton className="add-option-button secondary"
                                               onClick={decrementOptions}>
                                        <div>
                                            <p>Option entfernen</p>
                                        </div>
                                    </IonButton>
                                </div>
                        }
                    </div>

                    <br></br>
                    {(questionType !== QuestionType.FREE_TEXT) &&
                        <>
                            <div style={{marginBottom: '115px'}}>
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
                            </div>
                        </>
                    }
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={closeModal}
                               tabIndex={0}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ' ') {
                                       closeModal();
                                   }
                               }}
                    >
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleChange}
                               tabIndex={0}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ' ') {
                                       handleChange();
                                   }
                               }}
                    >

                        <div>
                            <p>Umfrage ändern</p>
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

export default SurveyChangeModal;
