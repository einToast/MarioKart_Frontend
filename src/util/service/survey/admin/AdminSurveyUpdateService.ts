import { AdminSurveyApi } from "../../../api";
import { QuestionInputDTO, QuestionReturnDTO, QuestionType } from "../../../api/config/dto";
import i18n from "../../../../i18n";
import { fitTranslatedList } from "../../../../i18n/translatable";

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
        translations: fitTranslatedList(question.translations, 'options', question.questionType === QuestionType.TEAM ? 0 : options.length)
    }
    return AdminSurveyApi.updateQuestion(question.id, questionInput);
}