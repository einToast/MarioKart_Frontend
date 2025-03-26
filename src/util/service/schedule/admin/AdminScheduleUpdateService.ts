import { AdminScheduleApi } from "../../../api";
import { BreakInputDTO, BreakReturnDTO, GameReturnDTO, PointsInputDTO, PointsReturnDTO, RoundInputDTO, RoundReturnDTO } from "../../../api/config/dto";

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

// shi.. roll back, handle in Backend?
// add Points to Game and set Points to null in Public
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

// into Backend?
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