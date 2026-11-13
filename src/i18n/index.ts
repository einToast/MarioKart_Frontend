import i18n from 'i18next';
import Cookies from 'js-cookie';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, isLanguage, Language, SUPPORTED_LANGUAGES } from './languages';
import de, { TranslationMessages } from './locales/de';

export const LANGUAGE_COOKIE = 'language';

const NAMESPACE = 'translation';

const localeLoaders = import.meta.glob<{ default: TranslationMessages }>(['./locales/*.ts', '!./locales/de.ts']);

i18n.use(initReactI18next).init({
    resources: { [DEFAULT_LANGUAGE]: { [NAMESPACE]: de } },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: NAMESPACE,
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});

const syncDocumentLanguage = (language: string) => {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
        document.title = i18n.t('app.title');
    }
};

i18n.on('languageChanged', syncDocumentLanguage);
syncDocumentLanguage(i18n.language);

export const loadLanguage = async (language: Language): Promise<void> => {
    if (i18n.hasResourceBundle(language, NAMESPACE)) {
        return;
    }
    const load = localeLoaders[`./locales/${language}.ts`];
    if (!load) {
        throw new Error(`No translations for language "${language}"`);
    }
    const { default: messages } = await load();
    i18n.addResourceBundle(language, NAMESPACE, messages);
};

export const getStoredLanguage = (): Language => {
    const stored = Cookies.get(LANGUAGE_COOKIE);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
};

export const currentLanguage = (): Language => isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

export const changeLanguage = async (language: Language): Promise<void> => {
    await loadLanguage(language);
    await i18n.changeLanguage(language);
    Cookies.set(LANGUAGE_COOKIE, language, { expires: 365, sameSite: 'strict', secure: true });
};

export const initLanguage = async (): Promise<void> => {
    const language = getStoredLanguage();
    if (language === currentLanguage()) {
        return;
    }
    try {
        await loadLanguage(language);
        await i18n.changeLanguage(language);
    } catch (error) {
        console.error('Error loading language:', error);
    }
};

export default i18n;
