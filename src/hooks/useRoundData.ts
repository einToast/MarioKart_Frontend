import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreakReturnDTO, RoundReturnDTO, TeamReturnDTO } from '../util/api/config/dto';
import { RoundOrBreak, UseRoundDataReturn } from '../util/api/config/interfaces';
import { PublicRegistrationService, PublicScheduleService, PublicSettingsService } from '../util/service';

export const useRoundData = (): UseRoundDataReturn => {
    const [currentRound, setCurrentRound] = useState<RoundOrBreak>(null);
    const [nextRound, setNextRound] = useState<RoundOrBreak>(null);
    const [teamsNotInCurrentRound, setTeamsNotInCurrentRound] = useState<TeamReturnDTO[]>([]);
    const [teamsNotInNextRound, setTeamsNotInNextRound] = useState<TeamReturnDTO[]>([]);
    const [error, setError] = useState<string>("");

    const navigate = useNavigate();

    const loadRoundWithTeams = async (
        round: RoundReturnDTO | BreakReturnDTO,
        setTeamsNotInRound: (teams: TeamReturnDTO[]) => void,
        setRound: (round: RoundReturnDTO | BreakReturnDTO) => void
    ) => {
        const teamsNotInRound = await PublicRegistrationService.getTeamsNotInRound(round.id);
        setTeamsNotInRound(teamsNotInRound);
        setRound(round);
    };

    const refreshRounds = async () => {
        try {
            const currentAndNextRound = await PublicScheduleService.getCurrentRounds();
            const pendingRounds: Promise<void>[] = [];
            let isBreak = false;

            if (currentAndNextRound[0]) {
                const formattedCurrentRound = formatRoundTimes(currentAndNextRound[0], isBreak);
                if ("breakEnded" in formattedCurrentRound) {
                    isBreak = true;
                    setCurrentRound(formattedCurrentRound);
                } else {
                    pendingRounds.push(loadRoundWithTeams(formattedCurrentRound, setTeamsNotInCurrentRound, setCurrentRound));
                }
            }

            if (currentAndNextRound[1] && !isBreak) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[1], false);
                pendingRounds.push(loadRoundWithTeams(formattedNextRound, setTeamsNotInNextRound, setNextRound));
            } else if (currentAndNextRound[0] && isBreak) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[0], true);
                pendingRounds.push(loadRoundWithTeams(formattedNextRound, setTeamsNotInCurrentRound, setNextRound));
            }

            if (!currentAndNextRound[0]){
                setCurrentRound(null)
            }
            if (!currentAndNextRound[1] && !isBreak){
                setNextRound(null)
            }

            // if (isBreak) {
            //     const formattedNextRound = formatRoundTimes(currentAndNextRound[0], true);
            //     setNextRound(formattedNextRound);
            //     console.log("isBreak")
            // } else {
            //     console.log("isNoBreak")
            // }

            const [tournamentOpen] = await Promise.all([
                PublicSettingsService.getTournamentOpen(),
                ...pendingRounds
            ]);
            if (!tournamentOpen) {
                navigate('/admin');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
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
        void refreshRounds();
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