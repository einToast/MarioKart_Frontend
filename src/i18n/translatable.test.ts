import { fitTranslatedList, localize, pruneTranslations,sanitizeTranslations, setTranslation, translatedChange, translatedValue, Translations } from './translatable';

type Question = { questionText: string; options: string[] };

const question = (translations?: Translations<Question>) => ({
    questionText: 'Wer gewinnt?',
    options: ['Rot', 'Blau', 'Grün'],
    translations,
});

describe('localize', () => {
    it('returns the item itself in the default language', () => {
        const item = question({ en: { questionText: 'Who wins?' } });

        expect(localize(item, 'de')).toBe(item);
    });

    it('replaces the translated fields', () => {
        expect(localize(question({ en: { questionText: 'Who wins?' } }), 'en')).toMatchObject({
            questionText: 'Who wins?',
            options: ['Rot', 'Blau', 'Grün'],
        });
    });

    it('falls back to the default text for blank and missing entries of a list', () => {
        expect(localize(question({ en: { options: ['Red', ' '] } }), 'en').options).toEqual(['Red', 'Blau', 'Grün']);
    });

    it('keeps the default text for a blank translation or a language without translations', () => {
        expect(localize(question({ en: { questionText: '  ' } }), 'en').questionText).toBe('Wer gewinnt?');
        expect(localize(question({ fr: { questionText: 'Qui gagne ?' } }), 'en').questionText).toBe('Wer gewinnt?');
        expect(localize(question(), 'en').questionText).toBe('Wer gewinnt?');
    });
});

describe('editing translations', () => {
    it('reads the default text or the translation of the edited language', () => {
        const item = { text: 'Pause', translations: { en: { text: 'Break' } } };

        expect(translatedValue(item, 'text', 'de')).toBe('Pause');
        expect(translatedValue(item, 'text', 'en')).toBe('Break');
        expect(translatedValue({ text: 'Pause' }, 'text', 'en')).toBeUndefined();
    });

    it('changes the default text in the default language and the translation otherwise', () => {
        const item = { text: 'Pause', translations: { en: { text: 'Break' } } };

        expect(translatedChange(item, 'text', 'de', 'Essen')).toEqual({ text: 'Essen' });
        expect(translatedChange(item, 'text', 'en', 'Food')).toEqual({ translations: { en: { text: 'Food' } } });
    });

    it('keeps the other fields and languages when setting a translation', () => {
        const translations: Translations<Question> = { en: { questionText: 'Who wins?' }, fr: { questionText: 'Qui gagne ?' } };

        expect(setTranslation(translations, 'en', 'options', ['Red'])).toEqual({
            en: { questionText: 'Who wins?', options: ['Red'] },
            fr: { questionText: 'Qui gagne ?' },
        });
        expect(translations.en).toEqual({ questionText: 'Who wins?' });
    });
});

describe('pruneTranslations', () => {
    it('trims texts and drops blank fields, empty languages and the default language', () => {
        expect(pruneTranslations<Question>({
            de: { questionText: 'Wer gewinnt?' },
            en: { questionText: ' Who wins? ', options: [' ', ''] },
            fr: { questionText: ' ' },
        })).toEqual({ en: { questionText: 'Who wins?' } });
    });

    it('keeps the positions of the entries of a list', () => {
        expect(pruneTranslations<Question>({ en: { options: ['', ' Blue '] } })).toEqual({ en: { options: ['', 'Blue'] } });
    });

    it('returns undefined when nothing is translated', () => {
        expect(pruneTranslations({})).toBeUndefined();
        expect(pruneTranslations(undefined)).toBeUndefined();
    });
});

describe('fitTranslatedList', () => {
    it('pads and cuts the translated list to the current number of entries', () => {
        expect(fitTranslatedList<Question>({ en: { options: ['Red'] }, fr: { options: ['Rouge', 'Bleu', 'Vert', 'Jaune'] } }, 'options', 3))
            .toEqual({ en: { options: ['Red', '', ''] }, fr: { options: ['Rouge', 'Bleu', 'Vert'] } });
    });

    it('keeps languages that only translate other fields', () => {
        expect(fitTranslatedList<Question>({ en: { questionText: 'Who wins?' } }, 'options', 2))
            .toEqual({ en: { questionText: 'Who wins?' } });
    });

    it('drops translations that become empty', () => {
        expect(fitTranslatedList<Question>({ en: { options: ['', '', 'Green'] } }, 'options', 2)).toEqual({});
        expect(fitTranslatedList<Question>(undefined, 'options', 2)).toEqual({});
    });
});

describe('sanitizeTranslations', () => {
    const fields = { questionText: { maxLength: 5 }, options: { maxLength: 3, list: true } };

    it('keeps only the known fields with the expected types and shortens them', () => {
        expect(sanitizeTranslations<Question>({
            en: { questionText: 'Who wins?', options: ['Red', 4, 'Yellow'], extra: 'x' },
            fr: { questionText: 42 },
        }, fields)).toEqual({ en: { questionText: 'Who w', options: ['Red', '', 'Yel'] } });
    });

    it('ignores anything that is not a map of languages', () => {
        expect(sanitizeTranslations<Question>('en', fields)).toBeUndefined();
        expect(sanitizeTranslations<Question>(['en'], fields)).toBeUndefined();
        expect(sanitizeTranslations<Question>(null, fields)).toBeUndefined();
        expect(sanitizeTranslations<Question>({ en: 'Who wins?' }, fields)).toBeUndefined();
    });
});
