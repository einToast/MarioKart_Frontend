import Cookies from "js-cookie";
import { RoundReturnDTO, TeamReturnDTO } from "../api/config/dto";
import { MatchPlanApi, RegistrationApi } from "../api";

export const getBothCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return MatchPlanApi.getCurrentRounds();
}

export const getTeamsRanked = async (): Promise<TeamReturnDTO[]> => {
    return RegistrationApi.getTeamsSortedByNormalPoints();
}

export const getAllRounds = async (): Promise<RoundReturnDTO[]> => {
    return MatchPlanApi.getRounds().then(rounds => rounds.sort((a, b) => a.roundNumber - b.roundNumber));
}

export const getRound = async (roundNumber: number): Promise<RoundReturnDTO> => {
    return MatchPlanApi.getRoundById(roundNumber);
}

export const getNumberOfUnplayedRounds = async (): Promise<number> => {
    const rounds = await MatchPlanApi.getRounds();
    return rounds.filter(round => !round.played).length;
}

export const setSelectedGamesOption = (option: string): void => {
    Cookies.set('selectedGamesOption', option, { expires: 1, sameSite: 'strict' });
}

export const getSelectedGamesOption = (): string | null => {
    try {
        return Cookies.get('selectedGamesOption') ?? null;
    } catch (e) {
        console.error('Error getting selected games option', e);
        return null;
    }
}

export const getTeamsInPause = async (roundId: number): Promise<TeamReturnDTO[]> => {
    return RegistrationApi.getTeamsNotInRound(roundId);
}
