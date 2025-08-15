import { PublicScheduleApi } from "../../../api";
import { RoundReturnDTO } from "../../../api/config/dto";

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return PublicScheduleApi.getCurrentRounds();
}

export const getNumberOfRoundsUnplayed = async (): Promise<number> => {
    return PublicScheduleApi.getNumberOfRoundsUnplayed();
}

export const isScheduleCreated = async (): Promise<boolean> => {
    return PublicScheduleApi.isScheduleCreated();
}

export const isFinalScheduleCreated = async (): Promise<boolean> => {
    return PublicScheduleApi.isFinalScheduleCreated();
}

export const isNumberOfRoundsUnplayedLessThanTwo = async (): Promise<boolean> => {
    const rounds = await getNumberOfRoundsUnplayed();
    return rounds < 2;
}

export const isNumberOfRoundsUnplayedZero = async (): Promise<boolean> => {
    const rounds = await getNumberOfRoundsUnplayed();
    return rounds === 0;
}

