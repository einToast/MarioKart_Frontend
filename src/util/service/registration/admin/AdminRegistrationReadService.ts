import { AdminRegistrationApi } from "../../../api";
import { TeamReturnDTO } from "../../../api/config/dto";

export const getTeamsSortedByGroupPoints = async (): Promise<TeamReturnDTO[]> => {
    return await AdminRegistrationApi.getTeamsSortedByGroupPoints();
}

export const getTeamsSortedByFinalPoints = async (): Promise<TeamReturnDTO[]> => {
    return await AdminRegistrationApi.getTeamsSortedByFinalPoints();
}

export const getFinalTeams = async (): Promise<TeamReturnDTO[]> => {
    return await AdminRegistrationApi.getFinalTeams();
}

