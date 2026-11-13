import { PublicNotificationApi } from "../../../api"
import { NotificationSubscriptionLanguageDTO } from "../../../api/config/dto"

export const updateLanguage = async (update: NotificationSubscriptionLanguageDTO): Promise<void> => {
    return await PublicNotificationApi.updateLanguage(update)
}
