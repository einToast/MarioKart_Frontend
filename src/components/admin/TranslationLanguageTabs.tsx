import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, Language, LANGUAGES, SUPPORTED_LANGUAGES } from '../../i18n/languages';
import './TranslationLanguageTabs.css';

const TranslationLanguageTabs: React.FC<{ value: Language, onChange: (language: Language) => void }> = ({ value, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="translationLanguages">
            <fieldset aria-label={t('admin.translations.label')}>
                <span>{t('admin.translations.label')}</span>
                {SUPPORTED_LANGUAGES.map(language => (
                    <button
                        type="button"
                        key={language}
                        aria-pressed={language === value}
                        className={language === value ? 'selected' : ''}
                        onClick={() => onChange(language)}
                    >
                        {language === DEFAULT_LANGUAGE
                            ? t('admin.translations.defaultLanguage', { language: LANGUAGES[language].name })
                            : LANGUAGES[language].name}
                    </button>
                ))}
            </fieldset>
            <p className={value === DEFAULT_LANGUAGE ? 'translationHintHidden' : undefined} aria-hidden={value === DEFAULT_LANGUAGE}>
                {t('admin.translations.hint')}
            </p>
        </div>
    );
};

export default TranslationLanguageTabs;
