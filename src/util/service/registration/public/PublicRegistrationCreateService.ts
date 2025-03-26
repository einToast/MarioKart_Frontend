import { PublicRegistrationApi } from "../../../api";
import { TeamInputDTO, TeamReturnDTO } from "../../../api/config/dto";

export const registerTeam = async (teamName: string, characterName: string): Promise<TeamReturnDTO> => {
    if (!teamName) {
        throw new Error("Der Teamname darf nicht leer sein!");
    } else if (!characterName) {
        throw new Error("Der Charakter darf nicht leer sein!");
    }

    const team: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: true,
        active: true
    };

    return await PublicRegistrationApi.registerTeam(team);
}