import { IonButton, IonContent, IonIcon, IonItem, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import { QuestionType } from "../../util/service/util";
import Toast from '../Toast';

const SurveyAddModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void }> = ({ showModal, closeModal }) => {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [finalTeamsOnly, setFinalTeamsOnly] = useState<boolean>(false);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

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
        closeModal({ surveyCreated: false });
    }

    const handleSubmit = async () => {
        try {
            const newQuestion = await AdminSurveyService.createQuestion(questionText, questionType, options, finalTeamsOnly);

            if (newQuestion) {
                resetQuestion();
                closeModal({ surveyCreated: true });
            } else {
                throw new TypeError('Umfrage konnte nicht erstellt werden');
            }
        } catch (error) {
            setError(error.message);
            setShowToast(true);
        }
    };

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
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                                    style={{ cursor: 'pointer' }}
                                >
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
                        {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.CHECKBOX) &&
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
                                        style={{ cursor: 'pointer' }}
                                        className="item-background-color"
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>
    );
};

export default SurveyAddModal;
