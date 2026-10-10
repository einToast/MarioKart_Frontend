import { useEffect, useState } from 'react';
import { SwitchDTO } from '../util/api/config/dto';
import { PublicSettingsService } from '../util/service';

// Loads the configured switches; reloads whenever `refreshKey` changes.
// Without them games fall back to numbered switches, so a failed request is not an error
export const useSwitches = (refreshKey?: unknown): SwitchDTO[] => {
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);

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
    }, [refreshKey]);

    return switches;
};
