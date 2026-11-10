import { IonIcon } from '@ionic/react';
import { chevronDownOutline, languageOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, currentLanguage } from '../i18n';
import { Language, LANGUAGES, SUPPORTED_LANGUAGES } from '../i18n/languages';
import './LanguageSwitch.css';

const LanguageSwitch: React.FC = () => {
    const { t, i18n } = useTranslation();
    const current = currentLanguage();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }
        optionRefs.current[SUPPORTED_LANGUAGES.indexOf(current)]?.focus();
        const handleClickOutside = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const close = () => {
        setOpen(false);
        toggleRef.current?.focus();
    };

    const choose = (language: Language) => {
        if (language !== i18n.language) {
            changeLanguage(language).catch(error => console.error('Error changing language:', error));
        }
        close();
    };

    const focusOption = (index: number) => {
        const count = SUPPORTED_LANGUAGES.length;
        optionRefs.current[(index + count) % count]?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!open) {
            return;
        }
        const focused = optionRefs.current.findIndex(option => option === document.activeElement);
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                close();
                break;
            case 'ArrowDown':
                event.preventDefault();
                focusOption(focused + 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                focusOption(focused - 1);
                break;
            case 'Home':
                event.preventDefault();
                focusOption(0);
                break;
            case 'End':
                event.preventDefault();
                focusOption(SUPPORTED_LANGUAGES.length - 1);
                break;
            case 'Tab':
                setOpen(false);
                break;
        }
    };

    return (
        <div className="languageSwitch" ref={rootRef} onKeyDown={handleKeyDown}>
            <button
                type="button"
                ref={toggleRef}
                className="languageSwitchToggle"
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={`${t('language.label')}: ${LANGUAGES[current].name}`}
                onClick={() => setOpen(isOpen => !isOpen)}
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
                                ref={element => { optionRefs.current[index] = element; }}
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
