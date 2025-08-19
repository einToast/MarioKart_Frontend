import { AdminScheduleApi } from "../../../api";

export const deleteSchedule = async (): Promise<void> => {
    return await AdminScheduleApi.deleteSchedule();
}

export const deleteFinalSchedule = async (): Promise<void> => {
    return await AdminScheduleApi.deleteFinalSchedule();
}