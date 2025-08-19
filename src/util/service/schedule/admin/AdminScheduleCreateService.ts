import { AdminScheduleApi } from "../../../api";
import { RoundReturnDTO } from "../../../api/config/dto";

export const createSchedule = async (): Promise<RoundReturnDTO[]> => {
    return await AdminScheduleApi.createSchedule();
}

export const createFinalSchedule = async (): Promise<RoundReturnDTO[]> => {
    return await AdminScheduleApi.createFinalSchedule();
}