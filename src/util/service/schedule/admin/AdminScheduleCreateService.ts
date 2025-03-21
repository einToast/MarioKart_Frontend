import { AdminScheduleApi } from "../../../api";
import { RoundReturnDTO } from "../../../api/config/dto";

export const createMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    return await AdminScheduleApi.createMatchPlan();
}

export const createFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    return await AdminScheduleApi.createFinalPlan();
}