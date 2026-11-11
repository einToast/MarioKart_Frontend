import { AdminSurveyApi } from "../../../api";
import { QuestionInputDTO, QuestionReturnDTO } from "../../../api/config/dto";
import { QuestionType } from "../../util";
import i18n from "../../../../i18n";
import { fitQuestionTranslations } from "./AdminSurveyCreateService";

export const updateQuestion = async (question: QuestionReturnDTO): Promise<QuestionReturnDTO> => {
    if (question.questionText === '') {
        throw new Error(i18n.t('errors.questionRequired'));
    } else if (question.questionType !== QuestionType.FREE_TEXT  && question.questionType !== QuestionType.TEAM_ONE_FREE_TEXT && question.options.length < 2) {
        throw new Error(i18n.t('errors.minimumTwoOptions'));
    } else if (question.questionType !== QuestionType.FREE_TEXT && question.questionType !== QuestionType.TEAM_ONE_FREE_TEXT && question.options.includes('')) {
        throw new Error(i18n.t('errors.allOptionsRequired'));
    }

    const options = (question.questionType === QuestionType.FREE_TEXT || question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) ? [] : question.options;
    const questionInput: QuestionInputDTO = {
        questionText: question.questionText,
        questionType: question.questionType,
        options: options,
        active: question.active,
        visible: question.visible,
        live: question.live,
        finalTeamsOnly: question.finalTeamsOnly,
        oneAnswerPerKey: question.oneAnswerPerKey,
        translations: fitQuestionTranslations(question.translations, question.questionType === QuestionType.TEAM ? 0 : options.length)
    }
    return AdminSurveyApi.updateQuestion(question.id, questionInput);
}