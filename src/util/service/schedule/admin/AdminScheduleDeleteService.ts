import { AdminScheduleApi } from "../../../api";

export const deleteMatchPlan = async (): Promise<void> => {
    return await AdminScheduleApi.deleteMatchPlan();
}

export const deleteFinalPlan = async (): Promise<void> => {
    return await AdminScheduleApi.deleteFinalPlan();
}