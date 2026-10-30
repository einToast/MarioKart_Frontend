import { AdminNotificationApi } from "../../../api"

export const getSubscriptionCount = async (): Promise<number> => {
    return await AdminNotificationApi.getSubscriptionCount()
}
