import { BreakReturnDTO, GameReturnDTO, RoundReturnDTO } from "./dto";

export interface User {
    name: string | null;
    character: string | null;
}

export interface AdminUser {
    loggedIn: boolean;
    username: string;
    token: string;
}

export interface SurveyModalResult {
    surveyResults?: boolean;
    surveyCreated?: boolean;
    surveyChanged?: boolean;
    surveyDeleted?: boolean;
}

export interface TeamModalResult {
    teamChanged?: boolean;
    teamDeleted?: boolean;
}

export interface BreakModalResult {
    breakChanged?: boolean;
}

export interface RoundHeaderProps {
    title: string;
    onOptionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    selectedOption: string;
}

export interface UseRoundDataReturn {
    currentRound: RoundReturnDTO | BreakReturnDTO | null;
    nextRound: RoundReturnDTO | BreakReturnDTO | null;
    noGames: boolean;
    error: string | null;
    refreshRounds: () => Promise<void>;
}

export interface GameListProps {
    games: GameReturnDTO[];
    user: User | null;
    viewType: 'all' | 'personal';
}

export interface RoundDisplayProps {
    round: RoundReturnDTO | BreakReturnDTO | null;
    title: string;
    user: User | null;
    viewType: 'all' | 'personal';
    noGames?: boolean;
}