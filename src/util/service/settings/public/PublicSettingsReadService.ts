import { PublicSettingsApi } from "../../../api";
import { TournamentDTO } from "../../../api/config/dto";

export const getSettings = async (): Promise<TournamentDTO> => {
    return await PublicSettingsApi.getSettings();
}

export const getRegistrationOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.registrationOpen ?? false;
}

export const getTournamentOpen = async (): Promise<boolean> => {
    const tournament = await getSettings();
    return tournament.tournamentOpen ?? false;
}

export const getMaxGamesCount = async (): Promise<number> => {
    const tournament = await getSettings();
    return tournament.maxGamesCount ?? 0;
}