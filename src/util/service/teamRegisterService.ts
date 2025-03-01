import { CharacterReturnDTO, TeamInputDTO, TeamReturnDTO, TournamentDTO } from "../api/config/dto";
import { addTeam, getAvailableCharacters, getCharacters, getTeams } from "../api/RegistrationApi";
import { getSettings, updateSettings } from "../api/SettingsApi";

export const getAllCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await getCharacters();
}

export const getAllAvailableCharacters = async (): Promise<CharacterReturnDTO[]> => {
    return await getAvailableCharacters();
}

export const getAllTeams = async (): Promise<TeamReturnDTO[]> => {
    return await getTeams();
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

    return await addTeam(team);
}

export const getRegistrationOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.registrationOpen ?? false;
}

export const getTournamentOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.tournamentOpen ?? false;
}

export const updateRegistrationOpen = async (registrationOpen: boolean): Promise<TournamentDTO> => {
    // const tournament = await getSettings();
    // tournament.registrationOpen = registrationOpen;
    const tournament: TournamentDTO = {
        registrationOpen: registrationOpen
    }
    return await updateSettings(tournament);
}

export const updateTournamentOpen = async (tournamentOpen: boolean): Promise<TournamentDTO> => {
    // const tournament = await getSettings();
    // tournament.tournamentOpen = tournamentOpen;
    const tournament: TournamentDTO = {
        tournamentOpen: tournamentOpen
    }
    return await updateSettings(tournament);
}