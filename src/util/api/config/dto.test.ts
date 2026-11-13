import { QuestionType, SurveyKeyMode } from './dto';

describe('enums shared with the backend', () => {
    it('uses the backend names as QuestionType values', () => {
        expect(Object.entries(QuestionType)).toEqual([
            ['MULTIPLE_CHOICE', 'MULTIPLE_CHOICE'],
            ['FREE_TEXT', 'FREE_TEXT'],
            ['CHECKBOX', 'CHECKBOX'],
            ['TEAM', 'TEAM'],
            ['TEAM_ONE_FREE_TEXT', 'TEAM_ONE_FREE_TEXT'],
        ]);
    });

    it('uses the backend names as SurveyKeyMode values', () => {
        expect(Object.values(SurveyKeyMode)).toEqual(['DISABLED', 'DISTRIBUTING', 'REQUIRED']);
    });
});
