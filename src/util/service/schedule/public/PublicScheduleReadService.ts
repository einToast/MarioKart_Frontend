import { PublicScheduleApi } from "../../../api";
import { getRankingHiddenRounds } from "../../settings/public/PublicSettingsReadService";
import { RoundReturnDTO, ScheduleOverviewDTO } from "../../../api/config/dto";

export const getCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return PublicScheduleApi.getCurrentRounds();
}

export const getOverview = async (): Promise<ScheduleOverviewDTO> => {
    return PublicScheduleApi.getOverview();
}

export const isTab2Shown = (overview: Pick<ScheduleOverviewDTO, 'scheduleCreated' | 'finalScheduleCreated' | 'numberOfRoundsUnplayed' | 'rankingHiddenRounds'>): boolean => {
    return overview.rankingHiddenRounds <= 0 || !overview.scheduleCreated || overview.finalScheduleCreated
        || overview.numberOfRoundsUnplayed > overview.rankingHiddenRounds;
}

export const isRankingShown = async (): Promise<boolean> => {
    const [scheduleCreated, finalScheduleCreated, numberOfRoundsUnplayed, rankingHiddenRounds] = await Promise.all([
        isScheduleCreated(),
        isFinalScheduleCreated(),
        getNumberOfRoundsUnplayed(),
        getRankingHiddenRounds(),
    ]);
    return isTab2Shown({ scheduleCreated, finalScheduleCreated, numberOfRoundsUnplayed, rankingHiddenRounds });
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

export const isNumberOfRoundsUnplayedZero = async (): Promise<boolean> => {
    const rounds = await getNumberOfRoundsUnplayed();
    return rounds === 0;
}

