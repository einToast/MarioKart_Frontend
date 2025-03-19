import { AdminSurveyApi } from "../../../api";
import { QuestionInputDTO, QuestionReturnDTO } from "../../../api/config/dto";
import { QuestionType } from "../../util";

export const createQuestion = async (
    question: string,
    questionType: QuestionType,
    options: string[],
    finalTeamsOnly: boolean
): Promise<QuestionReturnDTO> => {
    if (question === '') {
        throw new Error('Die Frage darf nicht leer sein');
    } else if (options.length < 2 && questionType !== QuestionType.FREE_TEXT && questionType !== QuestionType.TEAM) {
        throw new Error('Es müssen mindestens 2 Optionen angegeben werden');
    } else if (options.some(option => option === '') && questionType !== QuestionType.FREE_TEXT && questionType !== QuestionType.TEAM) {
        throw new Error('Alle Optionen müssen ausgefüllt sein');
    }

    const questionInput: QuestionInputDTO = {
        questionText: question,
        questionType: questionType,
        options: options,
        active: false,
        visible: false,
        live: false,
        finalTeamsOnly: finalTeamsOnly
    }
    return AdminSurveyApi.createQuestion(questionInput);
}