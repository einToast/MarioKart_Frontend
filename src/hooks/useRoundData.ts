import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { BreakReturnDTO, RoundReturnDTO, TeamReturnDTO } from '../util/api/config/dto';
import { UseRoundDataReturn } from '../util/api/config/interfaces';
import { PublicRegistrationService, PublicScheduleService, PublicSettingsService } from '../util/service';

export const useRoundData = (): UseRoundDataReturn => {
    const [currentRound, setCurrentRound] = useState<RoundReturnDTO | BreakReturnDTO | null>(null);
    const [nextRound, setNextRound] = useState<RoundReturnDTO | BreakReturnDTO | null>(null);
    const [teamsNotInCurrentRound, setTeamsNotInCurrentRound] = useState<TeamReturnDTO[]>([]);
    const [teamsNotInNextRound, setTeamsNotInNextRound] = useState<TeamReturnDTO[]>([]);
    const [error, setError] = useState<string>("");

    const history = useHistory();

    const refreshRounds = async () => {
        try {
            const currentAndNextRound = await PublicScheduleService.getCurrentRounds();
            let isBreak = false;

            if (currentAndNextRound[0]) {
                const formattedCurrentRound = formatRoundTimes(currentAndNextRound[0], isBreak);
                if ("breakEnded" in formattedCurrentRound) {
                    isBreak = true;
                } else {
                    setTeamsNotInCurrentRound(await PublicRegistrationService.getTeamsNotInRound(formattedCurrentRound.id));
                }
                setCurrentRound(formattedCurrentRound);
            }


            if (currentAndNextRound[1]) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[1], false);
                setNextRound(formattedNextRound);
                setTeamsNotInNextRound(await PublicRegistrationService.getTeamsNotInRound(formattedNextRound.id));
            }

            if (isBreak) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[0], true);
                setNextRound(formattedNextRound);
            }

            const tournamentOpen = await PublicSettingsService.getTournamentOpen();
            if (!tournamentOpen) {
                history.push('/admin');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatRoundTimes = (round: RoundReturnDTO, isBreak: boolean): RoundReturnDTO | BreakReturnDTO => {
        const formattedRound = { ...round };
        formattedRound.endTime = round.endTime.split('T')[1].slice(0, 5);
        formattedRound.startTime = round.startTime.split('T')[1].slice(0, 5);

        if (formattedRound.breakTime && !formattedRound.breakTime.breakEnded && !isBreak) {
            formattedRound.breakTime.endTime = formattedRound.breakTime.endTime.split('T')[1].slice(0, 5);
            formattedRound.breakTime.startTime = formattedRound.breakTime.startTime.split('T')[1].slice(0, 5);
            return formattedRound.breakTime;
        }

        return formattedRound;
    };

    useEffect(() => {
        refreshRounds();
    }, []);

    return {
        currentRound,
        nextRound,
        teamsNotInCurrentRound,
        teamsNotInNextRound,
        error,
        refreshRounds
    };
};