import { AdminRegistrationApi } from "../../../api";
import { TeamInputDTO, TeamReturnDTO } from "../../../api/config/dto";

export const updateTeam = async (team: TeamReturnDTO): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: team.teamName,
        characterName: team.character.characterName,
        finalReady: team.finalReady,
        active: team.active,
    }

    return await AdminRegistrationApi.updateTeam(team.id, teamInput);

}

export const updateTeamNameAndCharacter = async (team: TeamReturnDTO, teamName: string, characterName: string): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: team.finalReady,
        active: team.active,
    }
    return await AdminRegistrationApi.updateTeam(team.id, teamInput);
}

// TODO: Into Backend?
export const resetAllTeamFinalParticipation = async (): Promise<TeamReturnDTO[]> => {
    const teams = await AdminRegistrationApi.getTeamsSortedByFinalPoints();
    const updatedTeams: TeamReturnDTO[] = [];

    for (const team of teams) {
        if (team.finalReady || !team.active) continue;

        const teamInput: TeamInputDTO = {
            teamName: team.teamName,
            characterName: team.character.characterName ?? team.teamName,
            finalReady: true,
        }
        updatedTeams.push(await AdminRegistrationApi.updateTeam(team.id, teamInput));
    }

    return updatedTeams;
}