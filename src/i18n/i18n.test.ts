import Cookies from 'js-cookie';
import i18n, { changeLanguage, getStoredLanguage, initLanguage, LANGUAGE_COOKIE } from '.';
import { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES } from './languages';
import de from './locales/de';

const locales = import.meta.glob<{ default: object }>('./locales/*.ts', { eager: true });

const PLURAL_SUFFIX = /(_ordinal)?_(zero|one|two|few|many|other)$/;

const keyPaths = (messages: object, prefix = ''): string[] => [...new Set(
    Object.entries(messages).flatMap(([key, value]) => {
        const path = `${prefix}${key.replace(PLURAL_SUFFIX, '')}`;
        if (Array.isArray(value)) {
            return [`${path}[${value.length}]`, ...value.flatMap((entry, index) => typeof entry === 'object' ? keyPaths(entry, `${path}[${index}].`) : [])];
        }
        return typeof value === 'object' && value !== null ? keyPaths(value, `${path}.`) : [path];
    }),
)].sort();

const interpolations = (messages: object): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    const collect = (value: unknown, path: string) => {
        if (typeof value === 'string') {
            const key = path.replace(PLURAL_SUFFIX, '');
            const names = new Set([...(result[key] ?? []), ...[...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1])]);
            result[key] = [...names].sort();
        } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([key, entry]) => collect(entry, `${path}.${key}`));
        }
    };
    collect(messages, '');
    return result;
};

describe('i18n', () => {
    it('starts in German', () => {
        expect(DEFAULT_LANGUAGE).toBe('de');
        expect(i18n.language).toBe('de');
        expect(i18n.t('schedule.title')).toBe('Spielplan');
    });

    it('has a locale file for every supported language and nothing else', () => {
        expect(Object.keys(locales).map(path => path.replace(/^\.\/locales\/(\w+)\.ts$/, '$1')).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
    });

    it.each(Object.entries(locales))('%s has the same keys and placeholders as the German texts', (_path, { default: messages }) => {
        expect(keyPaths(messages)).toEqual(keyPaths(de));
        expect(interpolations(messages)).toEqual(interpolations(de));
    });

    it('loads, applies and remembers another language', async () => {
        await changeLanguage('en');

        expect(i18n.language).toBe('en');
        expect(i18n.t('schedule.title')).toBe('Schedule');
        expect(document.documentElement.lang).toBe('en');
        expect(Cookies.get(LANGUAGE_COOKIE)).toBe('en');
        expect(getStoredLanguage()).toBe('en');
    });

    it('uses the plural forms of the language', async () => {
        expect(i18n.t('ranking.points', { count: 1 })).toBe('1 Punkt');
        expect(i18n.t('ranking.points', { count: 3 })).toBe('3 Punkte');

        await changeLanguage('en');

        expect(i18n.t('ranking.points', { count: 1 })).toBe('1 point');
    });

    it('writes places as ordinals of the language', async () => {
        expect([1, 2, 3, 11].map(count => i18n.t('ranking.place', { count, ordinal: true })))
            .toEqual(['1. Platz', '2. Platz', '3. Platz', '11. Platz']);

        await changeLanguage('en');

        expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23].map(count => i18n.t('ranking.place', { count, ordinal: true }))).toEqual([
            '1st place', '2nd place', '3rd place', '4th place', '11th place', '12th place', '13th place', '21st place', '22nd place', '23rd place',
        ]);
    });

    it('restores the remembered language on start', async () => {
        Cookies.set(LANGUAGE_COOKIE, 'en');

        await initLanguage();

        expect(i18n.language).toBe('en');
    });

    it('falls back to German for an unknown remembered language', async () => {
        Cookies.set(LANGUAGE_COOKIE, 'xx');

        await initLanguage();

        expect(getStoredLanguage()).toBe('de');
        expect(i18n.language).toBe('de');
    });

    it('recognises only supported languages', () => {
        expect(isLanguage('en')).toBe(true);
        expect(isLanguage('fr')).toBe(false);
        expect(isLanguage('toString')).toBe(false);
        expect(isLanguage(undefined)).toBe(false);
    });
});
