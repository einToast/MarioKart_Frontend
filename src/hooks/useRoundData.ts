import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { BreakReturnDTO, RoundReturnDTO } from '../util/api/config/dto';
import { UseRoundDataReturn } from '../util/api/config/interfaces';
import { getBothCurrentRounds } from '../util/service/dashboardService';
import { getTournamentOpen } from '../util/service/teamRegisterService';

export const useRoundData = (): UseRoundDataReturn => {
    const [currentRound, setCurrentRound] = useState<RoundReturnDTO | BreakReturnDTO | null>(null);
    const [nextRound, setNextRound] = useState<RoundReturnDTO | BreakReturnDTO | null>(null);
    const [noGames, setNoGames] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const history = useHistory();

    const refreshRounds = async () => {
        try {
            const currentAndNextRound = await getBothCurrentRounds();

            if (currentAndNextRound[0]) {
                const formattedCurrentRound = formatRoundTimes(currentAndNextRound[0]);
                setCurrentRound(formattedCurrentRound);
                setNoGames(false);
            } else {
                setNoGames(true);
            }

            if (currentAndNextRound[1]) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[1]);
                setNextRound(formattedNextRound);
            }

            const tournamentOpen = await getTournamentOpen();
            if (!tournamentOpen) {
                history.push('/admin');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatRoundTimes = (round: RoundReturnDTO): RoundReturnDTO => {
        const formattedRound = { ...round };
        formattedRound.endTime = round.endTime.split('T')[1].slice(0, 5);
        formattedRound.startTime = round.startTime.split('T')[1].slice(0, 5);

        if (formattedRound.breakTime) {
            formattedRound.breakTime.endTime = formattedRound.breakTime.endTime.split('T')[1].slice(0, 5);
            formattedRound.breakTime.startTime = formattedRound.breakTime.startTime.split('T')[1].slice(0, 5);
        }

        return formattedRound;
    };

    useEffect(() => {
        refreshRounds();
    }, []);

    return {
        currentRound,
        nextRound,
        noGames,
        error,
        refreshRounds
    };
}; 