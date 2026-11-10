export const LANGUAGES = {
    de: { name: 'Deutsch', locale: 'de-DE' },
    en: { name: 'English', locale: 'en-GB' },
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = 'de';

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES) as Language[];

export const TRANSLATION_LANGUAGES = SUPPORTED_LANGUAGES.filter(language => language !== DEFAULT_LANGUAGE);

export const isLanguage = (value: unknown): value is Language =>
    typeof value === 'string' && Object.hasOwn(LANGUAGES, value);
