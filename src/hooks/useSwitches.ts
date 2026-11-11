import { useCallback, useEffect, useMemo, useState } from 'react';
import { SwitchDTO } from '../util/api/config/dto';
import { PublicSettingsService } from '../util/service';
import { useWebSocketConnection } from './useWebSocketConnection';
import { useLocalize } from './useLocalize';

export const SETTINGS_TOPIC = '/topic/settings';

export const useSwitches = (refreshKey?: unknown): { switches: SwitchDTO[]; reloadSwitches: () => void } => {
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);
    const [reloadCount, setReloadCount] = useState<number>(0);

    const reloadSwitches = useCallback(() => setReloadCount(count => count + 1), []);

    useWebSocketConnection(SETTINGS_TOPIC, reloadSwitches);

    useEffect(() => {
        let cancelled = false;
        PublicSettingsService.getSwitches()
            .then(loaded => {
                if (!cancelled) {
                    setSwitches(loaded);
                }
            })
            .catch(error => {
                console.error("Error fetching switches:", error);
            });
        return () => {
            cancelled = true;
        };
    }, [refreshKey, reloadCount]);

    const localize = useLocalize();
    const localizedSwitches = useMemo(() => switches.map(localize), [switches, localize]);

    return { switches: localizedSwitches, reloadSwitches };
};
