import { AdminSettingsApi } from "../../../api";

export const reset = async (): Promise<void> => {
    return await AdminSettingsApi.reset();
}
