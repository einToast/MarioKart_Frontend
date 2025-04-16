import { AdminScheduleApi } from "../../../api";
import { BreakInputDTO, BreakReturnDTO, GameInputFullDTO, GameReturnDTO, PointsInputDTO, PointsInputFullDTO, PointsReturnDTO, RoundInputDTO, RoundInputFullDTO, RoundReturnDTO, TeamInputDTO } from "../../../api/config/dto";

export const updateRoundPlayed = async (roundId: number, played: boolean): Promise<RoundReturnDTO> => {
    const roundInput: RoundInputDTO = {
        played: played
    }
    return await AdminScheduleApi.updateRoundPlayed(roundId, roundInput);
}

export const updatePoints = async (roundId: number, gameId: number, teamId: number, points: number): Promise<PointsReturnDTO> => {
    const pointInput: PointsInputDTO = {
        points: points,
    }
    return await AdminScheduleApi.updatePoints(roundId, gameId, teamId, pointInput);
}

export const updateBreak = async (roundId: number, breakDuration: number, breakEnded: boolean): Promise<BreakReturnDTO> => {
    const breakInput: BreakInputDTO = {
        roundId: roundId,
        breakDuration: breakDuration,
        breakEnded: breakEnded,
    }
    return await AdminScheduleApi.updateBreak(breakInput);
}

export const saveRoundFull = async (round: RoundReturnDTO): Promise<RoundReturnDTO> => {
    const gameInputs: GameInputFullDTO[] = round.games.map(game => {
        const pointInputs: PointsInputFullDTO[] = game.points?.map(point => {
            const teamInput: TeamInputDTO = {
                teamName: point.team.teamName,
                characterName: point.team.character.characterName,
                finalReady: point.team.finalReady,
                active: point.team.active
            };
            
            return {
                points: point.points,
                team: teamInput
            };
        }) || [];
        
        return {
            points: pointInputs
        };
    });
    
    const roundInput: RoundInputFullDTO = {
        played: round.played,
        games: gameInputs
    };

    console.log("RoundInputFullDTO", roundInput);
    
    return await AdminScheduleApi.updateRoundFull(round.id, roundInput);
}

export const saveRound = async (round: RoundReturnDTO): Promise<RoundReturnDTO> => {
    for (const game of round.games ?? []) {
        for (const team of game.teams ?? []) {
            await updatePoints(
                round.id,
                game.id,
                team.id,
                game.points?.find(point => point?.team.id === team.id)?.points ?? 0
            );
        }
    }

    return await updateRoundPlayed(round.id, round.played);
}

export const saveGameDirect = async (game: GameReturnDTO): Promise<GameReturnDTO> => {

    const pointInputs: PointsInputFullDTO[] = game.points?.map(point => ({
        points: point.points,
        team: {
            teamName: point.team.teamName,
            characterName: point.team.character.characterName,
            finalReady: point.team.finalReady,
            active: point.team.active
        }
    })) || [];
    
    const gameInput: GameInputFullDTO = {
        points: pointInputs
    };

    console.log("GameInputFullDTO", gameInput);
    
    return await AdminScheduleApi.updateGame(game.id, gameInput);
};

export const saveGame = async (roundId: number, game: GameReturnDTO): Promise<PointsReturnDTO[]> => {
    const points: PointsReturnDTO[] = [];
    for (const team of game.teams ?? []) {
        points.push(await updatePoints(
            roundId,
            game.id,
            team.id,
            game.points?.find(point => point?.team.id === team.id)?.points ?? 0
        ));
    }
    return points;
}