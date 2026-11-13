import apiClient, { ApiPath } from "../../config/apiClient";
import { NotificationSubscriptionLanguageDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'NOTIFICATION');

export const updateLanguage = async (update: NotificationSubscriptionLanguageDTO): Promise<void> => {
    await apiClient.put(`${BASE_URL}/subscription/language`, update);
};
