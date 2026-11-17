import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '../../i18n';
import { Language, LANGUAGES, SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { useBaseLanguage } from '../../hooks/useBaseLanguage';
import './TranslationLanguageTabs.css';

const TranslationLanguageTabs: React.FC<{ value: Language, onChange: (language: Language) => void }> = ({ value, onChange }) => {
    const { t } = useTranslation();
    const baseLanguage = useBaseLanguage();
    const languages = [baseLanguage, ...SUPPORTED_LANGUAGES.filter(language => language !== baseLanguage)];

    return (
        <div className="translationLanguages">
            <fieldset aria-label={t('admin.translations.label')}>
                <span>{t('admin.translations.label')}</span>
                {languages.map(language => (
                    <button
                        type="button"
                        key={language}
                        aria-pressed={language === value}
                        className={language === value ? 'selected' : ''}
                        onClick={() => loadLanguage(language).catch(console.error).finally(() => onChange(language))}
                    >
                        {language === baseLanguage
                            ? t('admin.translations.defaultLanguage', { language: LANGUAGES[language].name })
                            : LANGUAGES[language].name}
                    </button>
                ))}
            </fieldset>
            <p className={value === baseLanguage ? 'translationHintHidden' : undefined} aria-hidden={value === baseLanguage}>
                {t('admin.translations.hint')}
            </p>
        </div>
    );
};

export default TranslationLanguageTabs;
