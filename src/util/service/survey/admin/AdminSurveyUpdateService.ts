import { AdminSurveyApi } from "../../../api";
import { QuestionInputDTO, QuestionReturnDTO } from "../../../api/config/dto";
import { QuestionType } from "../../util";

export const updateQuestion = async (question: QuestionReturnDTO): Promise<QuestionReturnDTO> => {
    if (question.questionText === '') {
        throw new Error('Die Frage darf nicht leer sein');
    } else if (question.questionType !== QuestionType.FREE_TEXT  && question.questionType !== QuestionType.TEAM_ONE_FREE_TEXT && question.options.length < 2) {
        throw new Error('Es müssen mindestens 2 Optionen angegeben werden');
    } else if (question.questionType !== QuestionType.FREE_TEXT && question.questionType !== QuestionType.TEAM_ONE_FREE_TEXT && question.options.some(option => option === '')) {
        throw new Error('Alle Optionen müssen ausgefüllt sein');
    }

    const questionInput: QuestionInputDTO = {
        questionText: question.questionText,
        questionType: question.questionType,
        options: (question.questionType === QuestionType.FREE_TEXT || question.questionType === QuestionType.TEAM_ONE_FREE_TEXT) ? [] : question.options,
        active: question.active,
        visible: question.visible,
        live: question.live,
        finalTeamsOnly: question.finalTeamsOnly
    }
    return AdminSurveyApi.updateQuestion(question.id, questionInput);
}