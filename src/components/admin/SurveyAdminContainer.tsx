import { IonToast } from '@ionic/react';
import React, { useState } from 'react';
import { errorToastColor } from '../../util/api/config/constants';
import { QuestionReturnDTO } from "../../util/api/config/dto";
import { SurveyAdminContainerProps } from "../../util/api/config/interfaces";
import { AdminSurveyService, PublicUserService } from '../../util/service';
import { QuestionType } from "../../util/service/util";
import SurveyAnswerModal from '../modals/SurveyAnswerModal';
import SurveyChangeModal from '../modals/SurveyChangeModal';
import SurveyDeleteModal from '../modals/SurveyDeleteModal';
import SurveyStatisticsModal from '../modals/SurveyStatisticsModal';
import SurveyAdminListItem from './SurveyAdminListItem';

const SurveyAdminContainer: React.FC<SurveyAdminContainerProps> = ({
    surveys,
    getQuestions,
    handleModalClose
}) => {
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionReturnDTO>({
        id: -1,
        questionText: '',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [],
        visible: false,
        active: false,
        live: false,
        finalTeamsOnly: false
    });
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);
    const [error, setError] = useState('');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const user = PublicUserService.getUser();

    const handleToggleVisibility = async (id: number) => {
        try {
            const question = surveys.find(survey => survey.id === id);
            if (!question) {
                throw new TypeError('Frage nicht gefunden');
            }
            question.visible = !question.visible;
            question.active = question.visible
            const updatedQuestion = await AdminSurveyService.updateQuestion(question);
            if (updatedQuestion) {
                getQuestions();
            } else {
                throw new TypeError('Sichtbarkeit konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            const question = surveys.find(survey => survey.id === id);
            if (!question) {
                throw new TypeError('Frage nicht gefunden');
            }
            question.active = !question.active;
            const updatedQuestion = await AdminSurveyService.updateQuestion(question);
            if (updatedQuestion) {
                getQuestions();
            } else {
                throw new TypeError('Aktivität konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleOpenAnswerModal = (question: QuestionReturnDTO) => {
        setSelectedQuestion(question);
        setShowAnswerModal(true);
    };

    const handleOpenChangeModal = (question: QuestionReturnDTO) => {
        setSelectedQuestion(question);
        setShowChangeModal(true);
    };

    const handleOpenDeleteModal = (question: QuestionReturnDTO) => {
        setSelectedQuestion(question);
        setShowDeleteModal(true);
    };

    const handleOpenStatisticsModal = (question: QuestionReturnDTO) => {
        setSelectedQuestion(question);
        setShowStatisticsModal(true);
    };



    return (
        <>
            <h3>Aktuelle Abstimmungen</h3>
            <div className="currentSurveyContainer">
                {surveys.map(survey => (
                    <SurveyAdminListItem
                        key={survey.id}
                        survey={survey}
                        onToggleVisibility={handleToggleVisibility}
                        onToggleActive={handleToggleActive}
                        onOpenAnswerModal={handleOpenAnswerModal}
                        onOpenStatisticsModal={handleOpenStatisticsModal}
                        onOpenChangeModal={handleOpenChangeModal}
                        onOpenDeleteModal={handleOpenDeleteModal}
                    />
                ))}
            </div>

            <SurveyChangeModal
                showModal={showChangeModal}
                closeModal={(result) => {
                    setShowChangeModal(false);
                    handleModalClose(result);
                }}
                question={selectedQuestion}
            />
            <SurveyDeleteModal
                showModal={showDeleteModal}
                closeModal={(result) => {
                    setShowDeleteModal(false);
                    handleModalClose(result);
                }}
                question={selectedQuestion}
            />
            <SurveyAnswerModal
                showModal={showAnswerModal}
                closeModal={(result) => {
                    setShowAnswerModal(false);
                    handleModalClose(result);
                }}
                question={selectedQuestion}
            />
            <SurveyStatisticsModal
                showModal={showStatisticsModal}
                closeModal={(result) => {
                    setShowStatisticsModal(false);
                    handleModalClose(result);
                }}
                question={selectedQuestion}
            />
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error ?? undefined}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </>
    );
};

export default SurveyAdminContainer; 