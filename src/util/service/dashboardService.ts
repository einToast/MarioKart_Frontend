import {RoundReturnDTO, TeamReturnDTO} from "../api/config/dto";
import {getCurrentRounds} from "../api/MatchPlanApi";
import {getAllTeams} from "./loginService";
import {getTeamsSortedByNormalPoints} from "../api/RegistrationApi";

export const getBothCurrentRounds = async (): Promise<RoundReturnDTO[]> => {
    const response = getCurrentRounds();
    return response;
}

export const getTeamsRanked = async (): Promise<TeamReturnDTO[]> => {
    const response = getTeamsSortedByNormalPoints()
    return response;
}