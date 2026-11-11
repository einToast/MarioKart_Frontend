import { useState } from 'react';
import { DEFAULT_LANGUAGE, Language } from '../i18n/languages';
import { setTranslation, Translations } from '../i18n/translatable';
import { QuestionTranslation } from '../util/api/config/dto';

export const useQuestionTranslations = () => {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const [translations, setTranslations] = useState<Translations<QuestionTranslation> | undefined>(undefined);

    const translating = language !== DEFAULT_LANGUAGE;

    const questionText = translations?.[language]?.questionText ?? '';

    const option = (index: number): string => translations?.[language]?.options?.[index] ?? '';

    const changeQuestionText = (value: string) =>
        setTranslations(current => setTranslation(current, language, 'questionText', value));

    const changeOption = (index: number, value: string) =>
        setTranslations(current => {
            const options = [...(current?.[language]?.options ?? [])];
            while (options.length < index) {
                options.push('');
            }
            options[index] = value;
            return setTranslation(current, language, 'options', options);
        });

    const reset = (initial?: Translations<QuestionTranslation>) => {
        setLanguage(DEFAULT_LANGUAGE);
        setTranslations(initial);
    };

    return { language, setLanguage, translating, translations, questionText, option, changeQuestionText, changeOption, reset };
};
