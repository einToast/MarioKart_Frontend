import { IonButton, IonContent, IonIcon, IonItem, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import { QuestionType } from "../../util/service/util";
import Toast from '../Toast';

const SurveyChangeModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {

    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [finalTeamsOnly, setFinalTeamsOnly] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

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
            question.finalTeamsOnly = finalTeamsOnly;
            const newQuestion = await AdminSurveyService.updateQuestion(question);

            if (newQuestion) {
                resetQuestion();
                closeModal({ surveyChanged: true });
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setShowToast(true);
        }

    };

    useEffect(() => {
        setQuestionText(question.questionText);
        setQuestionType(question.questionType);
        setOptions((question.options) ? question.options : ['']);
        setNumberOfOptions((question.options) ? question.options.length : 0);
        setFinalTeamsOnly(question.finalTeamsOnly);

    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyChanged: false })}>
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
                                <select value={questionType} onChange={(e) => handleQuestionTypeChange(e)} disabled style={{ color: 'grey' }}>
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
                        {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.CHECKBOX) &&
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
                    {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.CHECKBOX) &&
                        <>
                            <div style={{ marginBottom: '115px' }}>
                                {Array.from({ length: numberOfOptions }, (_, index) => (
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
                    {(questionType === QuestionType.TEAM) &&
                        <div className="borderContainer multipleSelect">
                            <div>
                                <p>Teamauswahl</p>
                                <IonItem className={"item-background-color"}>
                                    <select
                                        value={finalTeamsOnly ? 'true' : 'false'}
                                        onChange={(e) => setFinalTeamsOnly(e.target.value === 'true')}
                                        className="item-background-color"
                                        disabled
                                    >
                                        <option value="false">Alle Teams</option>
                                        <option value="true">Nur Finalteams</option>
                                    </select>
                                </IonItem>
                            </div>
                        </div>
                    }
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={() => closeModal({ surveyChanged: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ surveyChanged: false });
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>
    );
};

export default SurveyChangeModal;
