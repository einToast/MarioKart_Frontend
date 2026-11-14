import { IonIcon } from '@ionic/react';
import { chevronDownOutline, languageOutline } from 'ionicons/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDropdown } from '../hooks/useDropdown';
import { changeLanguage, currentLanguage } from '../i18n';
import { Language, LANGUAGES, SUPPORTED_LANGUAGES } from '../i18n/languages';
import './LanguageSwitch.css';
import { NotificationService } from '../util/service';

const LanguageSwitch: React.FC = () => {
    const { t, i18n } = useTranslation();
    const current = currentLanguage();
    const { open, toggle, close, rootRef, toggleRef, optionRef, onToggleKeyDown } = useDropdown(
        SUPPORTED_LANGUAGES.map(language => LANGUAGES[language].name),
        SUPPORTED_LANGUAGES.indexOf(current),
    );

    const choose = (language: Language) => {
        if (language !== i18n.language) {
            changeLanguage(language)
                .then(() => NotificationService.updateLanguage(language))
                .catch(error => console.error('Error changing language:', error));
        }
        close();
    };

    return (
        <div className="languageSwitch" ref={rootRef}>
            <button
                type="button"
                ref={toggleRef}
                className="languageSwitchToggle"
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={`${t('language.label')}: ${LANGUAGES[current].name}`}
                onClick={toggle}
                onKeyDown={onToggleKeyDown}
            >
                <IonIcon aria-hidden="true" icon={languageOutline} className="languageSwitchSymbol" />
                <span lang={current}>{current.toUpperCase()}</span>
                <IonIcon aria-hidden="true" icon={chevronDownOutline} />
            </button>
            {open && (
                <ul className="languageSwitchMenu" aria-label={t('language.label')}>
                    {SUPPORTED_LANGUAGES.map((language, index) => (
                        <li key={language}>
                            <button
                                type="button"
                                ref={optionRef(index)}
                                lang={language}
                                aria-pressed={language === current}
                                onClick={() => choose(language)}
                            >
                                <span className="languageCode">{language.toUpperCase()}</span>
                                <span>{LANGUAGES[language].name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageSwitch;
