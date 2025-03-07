import {
    BreakInputDTO,
    BreakReturnDTO,
    GameReturnDTO,
    PointsInputDTO,
    PointsReturnDTO,
    RoundInputDTO,
    RoundReturnDTO,
    TeamInputDTO,
    TeamReturnDTO
} from "../api/config/dto";
import {
    checkFinalPlan,
    checkMatchPlan,
    createFinalPlan,
    createMatchPlan,
    deleteFinalPlan,
    deleteMatchPlan, getBreak, updateBreak,
    updatePoints,
    updateRoundPlayed
} from "../api/MatchPlanApi";
import { deleteAllTeams, deleteTeam, getTeamsSortedByFinalPoints, updateTeam } from "../api/RegistrationApi";
import { reset } from "../api/SettingsApi";
import { removeQuestions } from "./surveyService";
import {
    getAllTeams,
    getRegistrationOpen,
    getTournamentOpen,
    updateRegistrationOpen,
    updateTournamentOpen
} from "./teamRegisterService";
import { ChangeType } from "./util";

export const saveRound = async (round: RoundReturnDTO): Promise<RoundReturnDTO> => {
    for (const game of round.games ?? []) {
        for (const team of game.teams ?? []) {
            const pointInput: PointsInputDTO = {
                points: game.points?.find(point => point?.team?.id === team.id)?.points ?? 0,
            }
            try {
                await updatePoints(round.id, game.id, team.id, pointInput);
            } catch (error) {
                console.error('Error updating points:', error);
                throw error;
            }
        }
    }
    const roundInput: RoundInputDTO = {
        played: round.played,
    }
    try {
        return await updateRoundPlayed(round.id, roundInput);
    } catch (error) {
        console.error('Error updating round played:', error);
        throw error;
    }
}

export const saveGame = async (roundId: number, game: GameReturnDTO): Promise<PointsReturnDTO[]> => {
    const points: PointsReturnDTO[] = [];
    for (const team of game.teams ?? []) {
        const pointInput: PointsInputDTO = {
            points: game.points?.find(point => point?.team?.id === team.id)?.points ?? 0,
        }
        try {
            points.push(await updatePoints(roundId, game.id, team.id, pointInput));
        } catch (error) {
            console.error('Error updating points:', error);
            throw error;
        }
    }
    return points;
}

export const getTeamTop4FinalRanked = async (): Promise<TeamReturnDTO[]> => {
    // TODO: calculate top 4 in backend
    return (await getTeamFinalRanked())
        .filter(team => team.finalReady)
        .slice(0, 4);
}

export const getTeamFinalRanked = async (): Promise<TeamReturnDTO[]> => {
    return (await getTeamsSortedByFinalPoints());
}

export const getRegisteredTeams = async (): Promise<TeamReturnDTO[]> => {
    return await getAllTeams()
}

export const getABreak = async (): Promise<BreakReturnDTO> => {
    return await getBreak();
}

export const changeTeam = async (team: TeamReturnDTO): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: team.teamName,
        characterName: team.character?.characterName ?? team.teamName,
        finalReady: team.finalReady,
        active: team.active,
    }

    try {
        return await updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
}

export const changeTeamNameAndCharacter = async (team: TeamReturnDTO, teamName: string, characterName: string): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: teamName,
        characterName: characterName,
        finalReady: team.finalReady,
        active: team.active,
    }
    try {
        return await updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }

}

export const changeBreak = async (roundId: number, breakDuration: number, breakEnded: boolean): Promise<BreakReturnDTO> => {
    const aBreak: BreakInputDTO = {
        roundId: roundId,
        breakDuration: breakDuration,
        breakEnded: breakEnded,
    }
    return await updateBreak(aBreak);
}

export const resetAllTeamFinalParticipation = async (): Promise<TeamReturnDTO[]> => {
    const teams = await getTeamsSortedByFinalPoints();
    const updatedTeams: TeamReturnDTO[] = [];

    for (const team of teams) {
        if (team.finalReady) {
            continue;
        }
        if (!team.active) {
            continue;
        }
        const teamInput: TeamInputDTO = {
            teamName: team.teamName,
            characterName: team.character?.characterName ?? team.teamName,
            finalReady: true,
        }
        try {
            updatedTeams.push(await updateTeam(team.id, teamInput));
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    }

    return updatedTeams;
}

export const createTeamMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    return await createMatchPlan();
}

export const createTeamFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    return await createFinalPlan();
}

export const checkMatch = async (): Promise<boolean> => {
    return await checkMatchPlan();
}

export const checkFinal = async (): Promise<boolean> => {
    return await checkFinalPlan();
}

export const removeTeam = async (team: TeamReturnDTO): Promise<void> => {
    return await deleteTeam(team.id);
}

export const deleteTeams = async (): Promise<void> => {
    return await deleteAllTeams();
}

export const deleteMatch = async (): Promise<void> => {
    return await deleteMatchPlan();
}

export const deleteFinal = async (): Promise<void> => {
    return await deleteFinalPlan();
}

export const resetEverything = async (): Promise<void> => {
    return await reset();
}

export const changeService = async (deleteType: ChangeType): Promise<void> => {
    switch (deleteType) {
        case ChangeType.TOURNAMENT:
            await updateTournamentOpen(!await getTournamentOpen());
            break;
        case ChangeType.REGISTRATION:
            await updateRegistrationOpen(!await getRegistrationOpen());
            break;
        case ChangeType.SURVEYS:
            await removeQuestions();
            break;
        case ChangeType.TEAMS:
            await deleteTeams();
            break;
        case ChangeType.MATCH_PLAN:
            await deleteMatch();
            break;
        case ChangeType.FINAL_PLAN:
            await deleteFinal();
            break;
        case ChangeType.ALL:
            await resetEverything();
            break;
        default:
            throw new Error('Error');
    }


}