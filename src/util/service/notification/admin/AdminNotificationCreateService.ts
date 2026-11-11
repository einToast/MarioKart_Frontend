import { AdminNotificationApi } from "../../../api"
import { NotificationRequestDTO, NotificationTranslation } from "../../../api/config/dto"
import { pruneTranslations, Translations } from "../../../../i18n/translatable"

export const sendNotificationToAll = async (title: string, message: string, translations?: Translations<NotificationTranslation>): Promise<void> => {
    const notification: NotificationRequestDTO = {
        title: title,
        message: message,
        translations: pruneTranslations(translations) ?? {}
    }
    return await AdminNotificationApi.sendNotificationToAll(notification)
}

export const sendNotificationToTeam = async (teamId: number, title: string, message: string, translations?: Translations<NotificationTranslation>): Promise<void> => {
    const notification: NotificationRequestDTO = {
        title: title,
        message: message,
        translations: pruneTranslations(translations) ?? {}
    }
    return await AdminNotificationApi.sendNotificationToTeam(teamId, notification)
}