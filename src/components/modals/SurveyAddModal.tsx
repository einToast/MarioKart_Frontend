import { IonButton, IonContent, IonIcon, IonItem, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useId, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService } from '../../util/service';
import { QuestionType } from "../../util/service/util";
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';
import { useQuestionTranslations } from '../../hooks/useQuestionTranslations';
import TranslationLanguageTabs from '../admin/TranslationLanguageTabs';

const SurveyAddModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void }> = ({ showModal, closeModal }) => {
    const { t } = useTranslation();
    const fieldId = useId();
    const translation = useQuestionTranslations();
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [finalTeamsOnly, setFinalTeamsOnly] = useState<boolean>(false);
    const [oneAnswerPerKey, setOneAnswerPerKey] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const handleOptionChange = (index: number, value: string) => {
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
        setOneAnswerPerKey(false);
        translation.reset();
        closeModal({ surveyCreated: false });
    }

    const handleSubmit = () => {
        AdminSurveyService.createQuestion(
            questionText,
            questionType,
            options,
            finalTeamsOnly,
            oneAnswerPerKey,
            translation.translations
        )
            .then(newQuestion => {
                if (newQuestion) {
                    resetQuestion();
                    return closeModal({ surveyCreated: true });
                } else {
                    setError(t('admin.surveys.notCreated'));
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    return (
        <IonModal isOpen={showModal} onDidDismiss={resetQuestion}>
            <IonContent>
                <h4>{t('admin.surveys.new')}</h4>
                <form onSubmit={handleSubmit}>
                    <TranslationLanguageTabs value={translation.language} onChange={translation.setLanguage} />

                    <div className="borderContainer">
                        <p id={`${fieldId}-question`}>{t('admin.surveys.question')}</p>
                        <input
                            type="text"
                            value={translation.translating ? translation.questionText : questionText}
                            onChange={(e) => translation.translating ? translation.changeQuestionText(e.target.value) : setQuestionText(e.target.value)}
                            aria-labelledby={`${fieldId}-question`}
                            placeholder={translation.translating ? questionText || t('admin.surveys.questionPlaceholder', { lng: translation.language }) : t('admin.surveys.questionPlaceholder')}
                            required={!translation.translating}
                        />
                    </div>

                    <div className="borderContainer multipleSelect">
                        <div>
                            <p>{t('admin.surveys.options')}</p>
                            <IonItem className={"item-background-color"}>
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                                    disabled={translation.translating}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {
                                        Object.keys(QuestionType)
                                            // .filter(key => key !== 'TEAM')
                                            .map((key) => (
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
                                <IonButton className="add-option-button" disabled={translation.translating}
                                    onClick={incrementOptions}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            incrementOptions();
                                        }
                                    }}
                                >
                                    <div>
                                        <p>{t('admin.surveys.addOption')}</p>
                                    </div>
                                </IonButton>
                                <IonButton className="add-option-button secondary" disabled={translation.translating}
                                    onClick={decrementOptions}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            decrementOptions();
                                        }
                                    }}

                                >
                                    <div>
                                        <p>{t('admin.surveys.removeOption')}</p>
                                    </div>
                                </IonButton>
                            </div>
                        }
                    </div>

                    <div className="borderContainer multipleSelect">
                        <div>
                            <p>{t('admin.surveys.answersPerDevice')}</p>
                            <IonItem className={"item-background-color"}>
                                <select
                                    value={oneAnswerPerKey ? 'true' : 'false'}
                                    onChange={(e) => setOneAnswerPerKey(e.target.value === 'true')}
                                    style={{ cursor: 'pointer' }}
                                    className="item-background-color"
                                >
                                    <option value="false">{t('admin.surveys.unlimited')}</option>
                                    <option value="true">{t('admin.surveys.oneAnswerPerKey')}</option>
                                </select>
                            </IonItem>
                        </div>
                    </div>

                    <br></br>
                    {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.CHECKBOX) &&
                        <div style={{ marginBottom: '115px' }}>
                            {Array.from({ length: numberOfOptions }, (_, index) => (
                                <div key={index} className="form-group">
                                    <label htmlFor={`${fieldId}-option-${index}`}>{t('admin.surveys.option', { number: index + 1 })}</label>
                                    <input
                                        id={`${fieldId}-option-${index}`}
                                        type="text"
                                        value={translation.translating ? translation.option(index) : options[index]}
                                        onChange={(e) => translation.translating ? translation.changeOption(index, e.target.value) : handleOptionChange(index, e.target.value)}
                                        placeholder={translation.translating ? options[index] || t('admin.surveys.optionPlaceholder', { number: index + 1, lng: translation.language }) : t('admin.surveys.optionPlaceholder', { number: index + 1 })}
                                        required={!translation.translating}
                                    />
                                </div>
                            ))}
                        </div>
                    }
                    {(questionType === QuestionType.TEAM) &&
                        <div className="borderContainer multipleSelect">
                            <div>
                                <p>{t('admin.surveys.teamSelection')}</p>
                                <IonItem className={"item-background-color"}>
                                    <select
                                        value={finalTeamsOnly ? 'true' : 'false'}
                                        onChange={(e) => setFinalTeamsOnly(e.target.value === 'true')}
                                        style={{ cursor: 'pointer' }}
                                        className="item-background-color"
                                    >
                                        <option value="false">{t('admin.surveys.allTeams')}</option>
                                        <option value="true">{t('admin.surveys.finalTeamsOnly')}</option>
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
                            <p>{t('common.cancel')}</p>
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
                            <p>{t('admin.surveys.save')}</p>
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
