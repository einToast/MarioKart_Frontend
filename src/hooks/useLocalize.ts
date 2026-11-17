import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localize } from '../i18n/translatable';
import { useBaseLanguage } from './useBaseLanguage';

export const useLocalize = () => {
    const { i18n } = useTranslation();
    const language = i18n.language;
    const baseLanguage = useBaseLanguage();
    return useCallback(<T extends { translations?: object }>(item: T): T => localize(item, language, baseLanguage), [language, baseLanguage]);
};
