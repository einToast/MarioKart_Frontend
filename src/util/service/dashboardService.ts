import {RoundReturnDTO, TeamReturnDTO} from "../api/config/dto";
import {getCurrentRounds, getRoundById, getRounds} from "../api/MatchPlanApi";
import {getAllTeams} from "./teamRegisterService";
import {getTeamsSortedByNormalPoints} from "../api/RegistrationApi";

export const getBothCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    const response = getCurrentRounds();
    return response;
}

export const getTeamsRanked = async (): Promise<TeamReturnDTO[]> => {
    const response = getTeamsSortedByNormalPoints()
    return response;
}

export const getAllRounds = async (): Promise<RoundReturnDTO[]> => {
    const response = getRounds();
    return response;
}

export const getRound = async (roundNumber: number): Promise<RoundReturnDTO> => {
    const response = getRoundById(roundNumber);
    return response;
}