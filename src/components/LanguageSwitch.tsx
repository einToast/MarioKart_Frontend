import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, currentLanguage } from '../i18n';
import { Language } from '../i18n/languages';
import { NotificationService } from '../util/service';
import LanguageDropdown from './LanguageDropdown';

const LanguageSwitch: React.FC = () => {
    const { t } = useTranslation();

    const choose = (language: Language) => {
        changeLanguage(language)
            .then(() => NotificationService.updateLanguage(language))
            .catch(error => console.error('Error changing language:', error));
    };

    return <LanguageDropdown value={currentLanguage()} onChange={choose} label={t('language.label')} />;
};

export default LanguageSwitch;
