import { ChangeType, convertUmlauts, QuestionType, SurveyKeyMode } from './util';

describe('convertUmlauts', () => {
    it.each([
        ['Grün', 'Gruen'],
        ['Weiß', 'Weiss'],
        ['Äpfel Öl Übung', 'Aepfel Oel Uebung'],
        ['ä ö ü', 'ae oe ue'],
        ['GROẞ', 'GROSS'],
    ])('converts "%s" to "%s"', (input, expected) => {
        expect(convertUmlauts(input)).toBe(expected);
    });

    it('leaves text without umlauts untouched', () => {
        expect(convertUmlauts('Rot Blau 123 -_!')).toBe('Rot Blau 123 -_!');
    });

    it('returns an empty string for an empty string', () => {
        expect(convertUmlauts('')).toBe('');
    });
});

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

    it('uses the German display names as ChangeType values', () => {
        expect(ChangeType).toMatchObject({
            REGISTRATION: 'Registrierung',
            TOURNAMENT: 'Turnier',
            SURVEYS: 'Umfragen',
            TEAMS: 'Teams',
            SCHEDULE: 'Spielplan',
            FINAL_SCHEDULE: 'Finalspiele',
            ALL: 'Anwendung',
        });
    });
});
