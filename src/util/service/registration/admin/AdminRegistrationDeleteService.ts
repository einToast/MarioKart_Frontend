import { AdminRegistrationApi } from "../../../api";
import { TeamReturnDTO } from "../../../api/config/dto";

export const deleteTeam = async (team: TeamReturnDTO): Promise<void> => {
    return await AdminRegistrationApi.deleteTeam(team.id);
}

export const deleteAllTeams = async (): Promise<void> => {
    return await AdminRegistrationApi.deleteAllTeams();
}