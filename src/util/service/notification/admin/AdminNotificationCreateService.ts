import { AdminNotificationApi } from "../../../api"

export const sendNotificationToAll = async (title: string, message: string): Promise<void> => {
    return await AdminNotificationApi.sendNotificationToAll(title, message)
}

export const sendNotificationToTeam = async (teamId: number, title: string, message: string): Promise<void> => {
    return await AdminNotificationApi.sendNotificationToTeam(teamId, title, message)
}