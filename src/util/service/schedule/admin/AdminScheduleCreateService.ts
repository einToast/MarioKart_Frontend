import { AdminScheduleApi } from "../../../api";
import { RoundReturnDTO, ScheduleInputDTO } from "../../../api/config/dto";

export const createSchedule = async (version: number, numFields: number, numRounds: number, teamsPerGame: number): Promise<RoundReturnDTO[]> => {
    const scheduleInput: ScheduleInputDTO = {
        version: version,
        numFields: numFields,
        numRounds: numRounds,
        teamsPerGame: teamsPerGame
    };
    return await AdminScheduleApi.createSchedule(scheduleInput);
}

export const createFinalSchedule = async (): Promise<RoundReturnDTO[]> => {
    return await AdminScheduleApi.createFinalSchedule();
}