import { PublicSettingsApi } from "../../../api";
import { SwitchDTO, TournamentDTO } from "../../../api/config/dto";
import { SurveyKeyMode } from "../../util";

export const DEFAULT_FINAL_TEAMS_COUNT = 4;

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

export const getSurveyKeyMode = async (): Promise<SurveyKeyMode> => {
    const tournament = await getSettings();
    return tournament.surveyKeyMode ?? SurveyKeyMode.DISABLED;
}

export const getMaxGamesCount = async (): Promise<number> => {
    const tournament = await getSettings();
    return tournament.maxGamesCount ?? 0;
}

export const getSwitches = async (): Promise<SwitchDTO[]> => {
    const tournament = await getSettings();
    return tournament.switches ?? [];
}

export const getFinalTeamsCount = async (): Promise<number> => {
    const tournament = await getSettings();
    return tournament.finalTeamsCount ?? DEFAULT_FINAL_TEAMS_COUNT;
}