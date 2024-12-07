import {CharacterReturnDTO, TeamInputDTO, TeamReturnDTO} from "../api/config/dto";
import {addTeam, getAvailableCharacters, getCharacters, getTeams} from "../api/RegistrationApi";
import {getSettings} from "../api/SettingsApi";

export const getAllCharacters = async (): Promise<CharacterReturnDTO[]> => {
    // console.log('Characters:', characters);
    return await getCharacters();
}

export const getAllAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await getAvailableCharacters();
}

export const getAllTeams = async (): Promise<TeamReturnDTO[]> => {
    return await getTeams();
}

export const createTeam = async (teamName:string, characterName:string): Promise<TeamReturnDTO> => {
    if (!teamName) {
        throw new Error("Der Teamname darf nicht leer sein!");
    } else if (!characterName) {
        throw new Error("Der Charakter darf nicht leer sein!");
    }

    const team: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: true
    };

    return await addTeam(team);
}

export const getRegistrationOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.tournamentOpen && tournament.registrationOpen;
}

export const getTournamentOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.tournamentOpen;
}