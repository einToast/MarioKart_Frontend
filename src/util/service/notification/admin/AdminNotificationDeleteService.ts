import { AdminNotificationApi } from "../../../api"

export const deleteAllSubscriptions = async (): Promise<void> => {
    return await AdminNotificationApi.deleteAllSubscriptions()
}
