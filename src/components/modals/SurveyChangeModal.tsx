import { IonButton, IonContent, IonIcon, IonItem, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useId, useState } from 'react';
import "../../pages/admin/SurveyAdmin.css";
import { QuestionReturnDTO, QuestionType } from "../../util/api/config/dto";
import { SurveyModalResult } from "../../util/api/config/interfaces";
import { AdminSurveyService } from '../../util/service';
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';
import SegmentedToggle from '../SegmentedToggle';
import { useQuestionTranslations } from '../../hooks/useQuestionTranslations';
import TranslationLanguageTabs from '../admin/TranslationLanguageTabs';

const SurveyChangeModal: React.FC<{ showModal: boolean, closeModal: (survey: SurveyModalResult) => void, question: QuestionReturnDTO }> = ({ showModal, closeModal, question }) => {
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

    const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuestionType(e.target.value as QuestionType);
        if (e.target.value === QuestionType.FREE_TEXT ||
            e.target.value === QuestionType.TEAM_ONE_FREE_TEXT) {
            setNumberOfOptions(0);
        } else {
            setNumberOfOptions(options.length);
        }
    }

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
    }

    const handleChange = () => {
        AdminSurveyService.updateQuestion({
            ...question,
            questionText: questionText,
            questionType: questionType,
            options: options,
            finalTeamsOnly: finalTeamsOnly,
            oneAnswerPerKey: oneAnswerPerKey,
            translations: translation.translations,
            active: question.active,
            visible: question.visible,
        })
            .then(updatedQuestion => {
                if (updatedQuestion) {
                    resetQuestion();
                    return closeModal({ surveyChanged: true });
                }
                setError(t('admin.surveys.notUpdated'));
                setShowToast(true);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    useEffect(() => {
        setQuestionText(question.questionText);
        setQuestionType(question.questionType);
        setOptions((question.options) ? question.options : ['']);
        setNumberOfOptions((question.options) ? question.options.length : 0);
        setFinalTeamsOnly(question.finalTeamsOnly);
        setOneAnswerPerKey(question.oneAnswerPerKey);
        translation.reset(question.translations);

    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ surveyChanged: false })}>
            <IonContent>
                <h4>{t('admin.surveys.edit')}</h4>
                <form onSubmit={handleChange}>
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
                                <IonButton className="add-option-button" disabled={translation.translating}
                                    onClick={incrementOptions}>
                                    <div>
                                        <p>{t('admin.surveys.addOption')}</p>
                                    </div>
                                </IonButton>
                                <IonButton className="add-option-button secondary" disabled={translation.translating}
                                    onClick={decrementOptions}>
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
                            <SegmentedToggle
                                label={t('admin.surveys.answersPerDevice')}
                                options={[
                                    { value: false, label: t('admin.surveys.unlimited') },
                                    { value: true, label: t('admin.surveys.oneAnswerPerKey') },
                                ]}
                                value={oneAnswerPerKey}
                                onChange={setOneAnswerPerKey}
                                disabled={translation.translating}
                            />
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
                                <SegmentedToggle
                                    label={t('admin.surveys.teamSelection')}
                                    options={[
                                        { value: false, label: t('admin.surveys.allTeams') },
                                        { value: true, label: t('admin.surveys.finalTeamsOnly') },
                                    ]}
                                    value={finalTeamsOnly}
                                    onChange={setFinalTeamsOnly}
                                    disabled
                                />
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
                            <p>{t('common.cancel')}</p>
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
                            <p>{t('admin.surveys.change')}</p>
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
