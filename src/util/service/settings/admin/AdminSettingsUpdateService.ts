import { AdminSettingsService, PublicSettingsService } from "..";
import { AdminSettingsApi } from "../../../api";
import { TournamentDTO } from "../../../api/config/dto";
import { AdminRegistrationService } from "../../registration";
import { AdminScheduleService } from "../../schedule";
import { AdminSurveyService } from "../../survey";
import { ChangeType } from "../../util";

export const updateSettings = async (tournament: TournamentDTO): Promise<TournamentDTO> => {
    return await AdminSettingsApi.updateSettings(tournament);
}

// TODO: this is a duplicate of resetEverything
export const reset = async (): Promise<void> => {
    return await AdminSettingsApi.reset();
}

export const resetEverything = async (): Promise<void> => {
    return await AdminSettingsApi.reset();
}

export const updateRegistrationOpen = async (registrationOpen: boolean): Promise<TournamentDTO> => {
    const tournament: TournamentDTO = {
        registrationOpen: registrationOpen
    }
    return await AdminSettingsApi.updateSettings(tournament);
}

export const updateTournamentOpen = async (tournamentOpen: boolean): Promise<TournamentDTO> => {
    const tournament: TournamentDTO = {
        tournamentOpen: tournamentOpen
    }
    return await AdminSettingsApi.updateSettings(tournament);
}

export const changeService = async (deleteType: ChangeType): Promise<void> => {
    switch (deleteType) {
        case ChangeType.TOURNAMENT:
            await AdminSettingsService.updateTournamentOpen(!await PublicSettingsService.getTournamentOpen());
            break;
        case ChangeType.REGISTRATION:
            await updateRegistrationOpen(!await PublicSettingsService.getRegistrationOpen());
            break;
        case ChangeType.SURVEYS:
            await AdminSurveyService.deleteAllQuestions();
            break;
        case ChangeType.TEAMS:
            await AdminRegistrationService.deleteAllTeams();
            break;
        case ChangeType.MATCH_PLAN:
            await AdminScheduleService.deleteMatchPlan();
            break;
        case ChangeType.FINAL_PLAN:
            await AdminScheduleService.deleteFinalPlan();
            break;
        case ChangeType.ALL:
            await resetEverything();
            break;
        default:
            throw new Error('Error');
    }
}