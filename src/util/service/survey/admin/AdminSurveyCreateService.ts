import { AdminSurveyApi } from "../../../api";
import { QuestionInputDTO, QuestionReturnDTO, QuestionTranslation } from "../../../api/config/dto";
import { QuestionType } from "../../util";
import i18n from "../../../../i18n";
import { pruneTranslations, Translations } from "../../../../i18n/translatable";

export const fitQuestionTranslations = (
    translations: Translations<QuestionTranslation> | undefined,
    optionCount: number
): Translations<QuestionTranslation> => {
    const fitted: Translations<QuestionTranslation> = {};
    for (const [language, fields] of Object.entries(translations ?? {})) {
        if (!fields) {
            continue;
        }
        fitted[language] = fields.options
            ? { ...fields, options: Array.from({ length: optionCount }, (_, index) => fields.options?.[index] ?? '') }
            : fields;
    }
    return pruneTranslations(fitted) ?? {};
};

export const createQuestion = async (
    question: string,
    questionType: QuestionType,
    options: string[],
    finalTeamsOnly: boolean,
    oneAnswerPerKey: boolean,
    translations?: Translations<QuestionTranslation>
): Promise<QuestionReturnDTO> => {
    if (question === '') {
        throw new Error(i18n.t('errors.questionRequired'));
    } else if (options.length < 2 && questionType !== QuestionType.FREE_TEXT &&
        questionType !== QuestionType.TEAM && questionType !== QuestionType.TEAM_ONE_FREE_TEXT) {
        throw new Error(i18n.t('errors.minimumTwoOptions'));
    } else if (options.includes('') && questionType !== QuestionType.FREE_TEXT &&
        questionType !== QuestionType.TEAM && questionType !== QuestionType.TEAM_ONE_FREE_TEXT) {
        throw new Error(i18n.t('errors.allOptionsRequired'));
    }

    const questionInput: QuestionInputDTO = {
        questionText: question,
        questionType: questionType,
        options: options,
        active: false,
        visible: false,
        live: false,
        finalTeamsOnly: finalTeamsOnly,
        oneAnswerPerKey: oneAnswerPerKey,
        translations: fitQuestionTranslations(translations, options.length)
    }
    return AdminSurveyApi.createQuestion(questionInput);
}