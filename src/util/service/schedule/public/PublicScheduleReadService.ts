import { PublicScheduleApi } from "../../../api";
import { RoundReturnDTO } from "../../../api/config/dto";

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return PublicScheduleApi.getCurrentRounds();
}

export const getNumberOfRoundsUnplayed = async (): Promise<number> => {
    return PublicScheduleApi.getNumberOfRoundsUnplayed();
}

export const isMatchPlanCreated = async (): Promise<boolean> => {
    return PublicScheduleApi.isMatchPlanCreated();
}

export const isFinalPlanCreated = async (): Promise<boolean> => {
    return PublicScheduleApi.isFinalPlanCreated();
}

