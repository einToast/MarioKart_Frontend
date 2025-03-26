import { PublicRegistrationApi } from "../../../api";
import { CharacterReturnDTO, TeamReturnDTO } from "../../../api/config/dto";

export const getTeams = async (): Promise<TeamReturnDTO[]> => {
    return await PublicRegistrationApi.getTeams();
}

export const getTeamsSortedByGroupPoints = async (): Promise<TeamReturnDTO[]> => {
    return await PublicRegistrationApi.getTeamsSortedByGroupPoints();
}

export const getTeamsNotInRound = async (roundId: number): Promise<TeamReturnDTO[]> => {
    return await PublicRegistrationApi.getTeamsNotInRound(roundId);
}

export const getAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await PublicRegistrationApi.getAvailableCharacters();
}

