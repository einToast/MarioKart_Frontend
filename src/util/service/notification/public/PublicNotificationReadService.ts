import { PublicNotificationApi } from "../../../api"

export const getPublicKey = async (): Promise<string> => {
    return await PublicNotificationApi.getPublicKey()
}