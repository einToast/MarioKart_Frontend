import {CharacterReturnDTO, TeamInputDTO, TeamReturnDTO} from "../api/config/dto";
import {addTeam, getAvailableCharacters, getCharacters, getTeams} from "../api/RegistrationApi";

export const getAllCharacters = async (): Promise<CharacterReturnDTO[]> => {
    const characters = await getCharacters();
    // console.log('Characters:', characters);
    return characters;
}

export const getAllAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    const characters = await getAvailableCharacters()  ;
    return characters;
}

export const getAllTeams = async (): Promise<TeamReturnDTO[]> => {
    const teams = await getTeams();
    return teams;
}

export const createTeam = async (teamName:string, characterName:string): Promise<TeamReturnDTO> => {
    if (!teamName) {
        throw new Error("Der Teamname darf nicht leer sein!");
    } else if (!characterName) {
        throw new Error("Der Charakter darf nicht leer sein!");
    }

    const team: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName
    };

    const response = await addTeam(team);
    return response;

}