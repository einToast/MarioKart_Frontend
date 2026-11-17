import { useSyncExternalStore } from 'react';
import { getBaseLanguage, Language, setBaseLanguage, subscribeBaseLanguage } from '../i18n/languages';
import { PublicSettingsService } from '../util/service';
import { SETTINGS_TOPIC } from './useSwitches';
import { useWebSocketConnection } from './useWebSocketConnection';

export const useBaseLanguage = (): Language => useSyncExternalStore(subscribeBaseLanguage, getBaseLanguage);

export const useBaseLanguageSync = (): void => {
    useWebSocketConnection(SETTINGS_TOPIC, () => {
        PublicSettingsService.getDefaultLanguage()
            .then(setBaseLanguage)
            .catch(error => console.error('Error fetching the default language:', error));
    });
};
