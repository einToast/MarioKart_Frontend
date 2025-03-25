import { AdminRegistrationApi } from "../../../api";
import { TeamInputDTO, TeamReturnDTO } from "../../../api/config/dto";

export const updateTeam = async (team: TeamReturnDTO): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: team.teamName,
        characterName: team.character.characterName,
        finalReady: team.finalReady,
        active: team.active,
    }

    try {
        return await AdminRegistrationApi.updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
}

export const updateTeamNameAndCharacter = async (team: TeamReturnDTO, teamName: string, characterName: string): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: team.finalReady,
        active: team.active,
    }
    try {
        return await AdminRegistrationApi.updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
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
        try {
            updatedTeams.push(await AdminRegistrationApi.updateTeam(team.id, teamInput));
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    }

    return updatedTeams;
}