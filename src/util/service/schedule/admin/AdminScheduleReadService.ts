import { BreakReturnDTO, RoundReturnDTO } from "../../../api/config/dto";
import { AdminScheduleApi } from "../../../api";


export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    return AdminScheduleApi.getRounds();
}

export const getRoundById = async (roundNumber: number): Promise<RoundReturnDTO> => {
    return AdminScheduleApi.getRoundById(roundNumber);
}

export const getBreak = async (): Promise<BreakReturnDTO> => {
    return await AdminScheduleApi.getBreak();
}