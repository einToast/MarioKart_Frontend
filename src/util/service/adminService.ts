import {
    GameReturnDTO,
    PointsInputDTO, PointsReturnDTO,
    RoundInputDTO,
    RoundReturnDTO,
    TeamInputDTO,
    TeamReturnDTO
} from "../api/config/dto";
import {getTeams, getTeamsSortedByFinalPoints, updateTeam} from "../api/RegistrationApi";
import {createFinalPlan, createMatchPlan, updatePoints, updateRoundPlayed} from "../api/MatchPlanApi";
import {getAllTeams} from "./teamRegisterService";

export const saveRound = async (round: RoundReturnDTO): Promise<RoundReturnDTO> => {
    for (const game of round.games) {
        for (const team of game.teams) {
            const pointInput: PointsInputDTO = {
                points: game.points.find(point => point.team.id === team.id).points,
            }
            try {
                await updatePoints(round.id, game.id, team.id, pointInput);
            } catch (error) {
                console.error('Error updating points:', error);
                throw error;
            }
        }
    }
    const roundInput : RoundInputDTO = {
        played: round.played,
    }
    try{
        return await updateRoundPlayed(round.id, roundInput);
    } catch (error) {
        console.error('Error updating round played:', error);
        throw error;
    }
}

export const saveGame = async (roundId: number, game: GameReturnDTO):Promise<PointsReturnDTO[]> => {
    const points: PointsReturnDTO[] = [];
    for (const team of game.teams) {
        const pointInput: PointsInputDTO = {
            points: game.points.find(point => point.team.id === team.id).points,
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

export const getTeamFinalRanked = async (): Promise<TeamReturnDTO[]> => {
    const response = (await getTeamsSortedByFinalPoints())
        .filter(team => team.finalReady)
        .slice(0, 4);
    return response;
}

export const getRegisteredTeams = async (): Promise<TeamReturnDTO[]> => {
    return await getAllTeams()
}

export const removeTeamFinalParticipation = async (team: TeamReturnDTO): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: team.teamName,
        characterName: team.character.characterName,
        finalReady: false,
    }

    try {
        return await updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
}

export const resetAllTeamFinalParticipation = async (): Promise<TeamReturnDTO[]> => {
    const teams = await getTeamsSortedByFinalPoints();
    const updatedTeams: TeamReturnDTO[] = [];

    for (const team of teams) {
        if (team.finalReady) {
            continue;
        }
        const teamInput: TeamInputDTO = {
            teamName: team.teamName,
            characterName: team.character.characterName,
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
    const response = await createMatchPlan();
    return response;
}

export const createTeamFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    const response = await createFinalPlan();
    return response;
}