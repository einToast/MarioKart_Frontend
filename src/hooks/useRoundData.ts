import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreakReturnDTO, RoundReturnDTO, TeamReturnDTO } from '../util/api/config/dto';
import { RoundOrBreak, UseRoundDataReturn } from '../util/api/config/interfaces';
import { PublicScheduleService } from '../util/service';
import i18n from '../i18n';

export const useRoundData = (): UseRoundDataReturn => {
    const [currentRound, setCurrentRound] = useState<RoundOrBreak>(null);
    const [nextRound, setNextRound] = useState<RoundOrBreak>(null);
    const [teamsNotInCurrentRound, setTeamsNotInCurrentRound] = useState<TeamReturnDTO[]>([]);
    const [teamsNotInNextRound, setTeamsNotInNextRound] = useState<TeamReturnDTO[]>([]);
    const [showTab2, setShowTab2] = useState<boolean | null>(null);
    const [error, setError] = useState<string>("");

    const navigate = useNavigate();

    const refreshRounds = async () => {
        try {
            const overview = await PublicScheduleService.getOverview();
            const currentAndNextRound = overview.currentRounds;
            const teamsNotInRound = (round: RoundReturnDTO | BreakReturnDTO) => overview.teamsNotInRound[round.id] ?? [];
            let isBreak = false;

            if (currentAndNextRound[0]) {
                const formattedCurrentRound = formatRoundTimes(currentAndNextRound[0], isBreak);
                if ("breakEnded" in formattedCurrentRound) {
                    isBreak = true;
                } else {
                    setTeamsNotInCurrentRound(teamsNotInRound(formattedCurrentRound));
                }
                setCurrentRound(formattedCurrentRound);
            }

            if (currentAndNextRound[1] && !isBreak) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[1], false);
                setTeamsNotInNextRound(teamsNotInRound(formattedNextRound));
                setNextRound(formattedNextRound);
            } else if (currentAndNextRound[0] && isBreak) {
                const formattedNextRound = formatRoundTimes(currentAndNextRound[0], true);
                setTeamsNotInCurrentRound(teamsNotInRound(formattedNextRound));
                setNextRound(formattedNextRound);
            }

            if (!currentAndNextRound[0]){
                setCurrentRound(null)
            }
            if (!currentAndNextRound[1] && !isBreak){
                setNextRound(null)
            }

            setShowTab2(PublicScheduleService.isTab2Shown(overview));

            if (!overview.tournamentOpen) {
                navigate('/admin');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : i18n.t('errors.currentRoundsNotLoaded'));
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
        showTab2,
        error,
        refreshRounds
    };
};
