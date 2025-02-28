import { BreakReturnDTO, GameReturnDTO, RoundReturnDTO } from "./dto";

export interface Team {
    id: number;
    name: string;
    character: string;
    punkte: number;
    switch: string | undefined;
    final_ready: boolean;
}

export interface User {
    loggedIn: boolean;
    name: string | null;
    character: string | null;
}

export interface LoginProps {
    setUser: (user: User | null) => void
}

export interface Character {
    name: string;
    imagePath: string;
}

export interface Game {
    id: number,
    switch: string,
    teams: Team[]
}

export interface Point {
    id: number,
    final_points: number,
    normal_poins: number,
    team: Team
}

export interface Round {
    id: number,
    final: boolean,
    gespielt: boolean,
    von: string,
    bis: string,
    games: Game[]
}

export interface Survey {
    id: number,
    active: boolean,
    question: string,
    answerType: string,
    teamCount: 4,
    teams: Team[],
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
    user: User;
    viewType: 'all' | 'personal';
}

export interface RoundDisplayProps {
    round: RoundReturnDTO | BreakReturnDTO | null;
    title: string;
    user: User;
    viewType: 'all' | 'personal';
    noGames?: boolean;
}