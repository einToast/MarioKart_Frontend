import { AdminNotificationApi } from "../../../api"
import { NotificationRequestDTO } from "../../../api/config/dto"

export const sendNotificationToAll = async (title: string, message: string): Promise<void> => {
    const notification: NotificationRequestDTO = {
        title: title,
        message: message
    }
    return await AdminNotificationApi.sendNotificationToAll(notification)
}

export const sendNotificationToTeam = async (teamId: number, title: string, message: string): Promise<void> => {
    const notification: NotificationRequestDTO = {
        title: title,
        message: message
    }
    return await AdminNotificationApi.sendNotificationToTeam(teamId, notification)
}