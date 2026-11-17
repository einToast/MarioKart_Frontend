export const LANGUAGES = {
    de: { name: 'Deutsch', locale: 'de-DE' },
    en: { name: 'English', locale: 'en-GB' },
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = 'de';

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as Language[];

export const isLanguage = (value: unknown): value is Language =>
    typeof value === 'string' && Object.hasOwn(LANGUAGES, value);

let baseLanguage: Language = DEFAULT_LANGUAGE;
const baseLanguageListeners = new Set<() => void>();

export const getBaseLanguage = (): Language => baseLanguage;

export const setBaseLanguage = (language: Language): void => {
    if (language === baseLanguage) {
        return;
    }
    baseLanguage = language;
    baseLanguageListeners.forEach(listener => listener());
};

export const subscribeBaseLanguage = (listener: () => void): (() => void) => {
    baseLanguageListeners.add(listener);
    return () => {
        baseLanguageListeners.delete(listener);
    };
};

export const translationLanguages = (): Language[] =>
    SUPPORTED_LANGUAGES.filter(language => language !== baseLanguage);
