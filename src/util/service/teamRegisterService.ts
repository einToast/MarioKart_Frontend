import { CharacterReturnDTO, TeamInputDTO, TeamReturnDTO, TournamentDTO } from "../api/config/dto";
import { RegistrationApi, SettingsApi } from "../api";

export const getAllCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await RegistrationApi.getCharacters();
}

export const getAllAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await RegistrationApi.getAvailableCharacters();
}

export const getAllTeams = async (): Promise<TeamReturnDTO[]> => {
    return await RegistrationApi.getTeams();
}

export const createTeam = async (teamName: string, characterName: string): Promise<TeamReturnDTO> => {
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

    return await RegistrationApi.addTeam(team);
}

export const getRegistrationOpen = async (): Promise<boolean> => {
    const tournament = await SettingsApi.getSettings();
    return tournament.registrationOpen ?? false;
}

export const getTournamentOpen = async (): Promise<boolean> => {
    const tournament = await SettingsApi.getSettings();
    return tournament.tournamentOpen ?? false;
}

export const updateRegistrationOpen = async (registrationOpen: boolean): Promise<TournamentDTO> => {
    const tournament: TournamentDTO = {
        registrationOpen: registrationOpen
    }
    return await SettingsApi.updateSettings(tournament);
}

export const updateTournamentOpen = async (tournamentOpen: boolean): Promise<TournamentDTO> => {
    const tournament: TournamentDTO = {
        tournamentOpen: tournamentOpen
    }
    return await SettingsApi.updateSettings(tournament);
}