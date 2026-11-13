import { PublicNotificationApi } from "../../../api"
import { NotificationSubscriptionEndpointDTO } from "../../../api/config/dto"

export const unsubscribe = async (subscription: NotificationSubscriptionEndpointDTO): Promise<void> => {
    return await PublicNotificationApi.unsubscribe(subscription)
}
