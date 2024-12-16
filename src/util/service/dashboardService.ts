import {RoundReturnDTO, TeamReturnDTO} from "../api/config/dto";
import {getCurrentRounds, getRoundById, getRounds} from "../api/MatchPlanApi";
import {getTeamsSortedByNormalPoints} from "../api/RegistrationApi";

export const getBothCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return getCurrentRounds();
}

export const getTeamsRanked = async (): Promise<TeamReturnDTO[]> => {
    return getTeamsSortedByNormalPoints();
}

export const getAllRounds = async (): Promise<RoundReturnDTO[]> => {
    return getRounds();
}

export const getRound = async (roundNumber: number): Promise<RoundReturnDTO> => {
    return getRoundById(roundNumber);
}

export const getNumberOfUnplayedRounds = async (): Promise<number> => {
    const rounds = await getRounds();
    return rounds.filter(round => !round.played).length;
}