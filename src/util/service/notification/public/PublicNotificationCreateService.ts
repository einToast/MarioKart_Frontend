import { PublicNotificationApi } from "../../../api"
import { NotificationSubscriptionDTO } from "../../../api/config/dto"

export const subscribe = async (subscriptionData: NotificationSubscriptionDTO): Promise<void> => {

    return await PublicNotificationApi.subscribe(subscriptionData)
}