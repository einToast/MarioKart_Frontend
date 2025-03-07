import Cookies from "js-cookie";
import { RoundReturnDTO, TeamReturnDTO } from "../api/config/dto";
import { getCurrentRounds, getRoundById, getRounds } from "../api/MatchPlanApi";
import { getTeamsNotInRound, getTeamsSortedByNormalPoints } from "../api/RegistrationApi";

export const getBothCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    return getCurrentRounds();
}

export const getTeamsRanked = async (): Promise<TeamReturnDTO[]> => {
    return getTeamsSortedByNormalPoints();
}

export const getAllRounds = async (): Promise<RoundReturnDTO[]> => {
    return getRounds().then(rounds => rounds.sort((a, b) => a.roundNumber - b.roundNumber));
}

export const getRound = async (roundNumber: number): Promise<RoundReturnDTO> => {
    return getRoundById(roundNumber);
}

export const getNumberOfUnplayedRounds = async (): Promise<number> => {
    const rounds = await getRounds();
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
    return getTeamsNotInRound(roundId);
}
