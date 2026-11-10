import { PublicRegistrationApi } from "../../../api";
import { TeamInputDTO, TeamReturnDTO } from "../../../api/config/dto";
import i18n from "../../../../i18n";

export const registerTeam = async (teamName: string, characterName: string): Promise<TeamReturnDTO> => {
    if (!teamName) {
        throw new Error(i18n.t('errors.teamNameRequired'));
    } else if (!characterName) {
        throw new Error(i18n.t('errors.characterRequired'));
    }

    const team: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: true,
        active: true
    };

    return await PublicRegistrationApi.registerTeam(team);
}