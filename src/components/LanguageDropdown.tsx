import { IonIcon } from '@ionic/react';
import { chevronDownOutline, languageOutline } from 'ionicons/icons';
import React, { useId } from 'react';
import { useDropdown } from '../hooks/useDropdown';
import { Language, LANGUAGES, SUPPORTED_LANGUAGES } from '../i18n/languages';
import { LanguageDropdownProps } from '../util/api/config/interfaces';
import './LanguageSwitch.css';

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ value, onChange, label, labelId }) => {
    const nameId = useId();
    const { open, toggle, close, rootRef, toggleRef, optionRef, onToggleKeyDown } = useDropdown(
        SUPPORTED_LANGUAGES.map(language => LANGUAGES[language].name),
        SUPPORTED_LANGUAGES.indexOf(value),
    );

    const choose = (language: Language) => {
        if (language !== value) {
            onChange(language);
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
                aria-label={labelId ? undefined : `${label}: ${LANGUAGES[value].name}`}
                aria-labelledby={labelId ? `${labelId} ${nameId}` : undefined}
                onClick={toggle}
                onKeyDown={onToggleKeyDown}
            >
                <IonIcon aria-hidden="true" icon={languageOutline} className="languageSwitchSymbol" />
                <span lang={value}>{value.toUpperCase()}</span>
                <span id={nameId} hidden>{LANGUAGES[value].name}</span>
                <IonIcon aria-hidden="true" icon={chevronDownOutline} />
            </button>
            {open && (
                <ul className="languageSwitchMenu" aria-label={label}>
                    {SUPPORTED_LANGUAGES.map((language, index) => (
                        <li key={language}>
                            <button
                                type="button"
                                ref={optionRef(index)}
                                lang={language}
                                aria-pressed={language === value}
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

export default LanguageDropdown;
