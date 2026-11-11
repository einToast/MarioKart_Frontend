import { QuestionType, SurveyKeyMode } from "../../service/util";
import { Translations } from "../../../i18n/translatable";


export interface RoundInputFullDTO {
    played: boolean;
    games: GameInputFullDTO[];
}

export interface GameInputFullDTO {
    id: number;
    points: PointsInputFullDTO[];
}

export interface PointsInputFullDTO {
    points: number;
    team: TeamInputDTO;
}

export interface RoundReturnDTO {
    id: number;
    roundNumber: number;
    startTime: string;
    endTime: string;
    finalGame: boolean;
    played: boolean;
    games: GameReturnDTO[];
    breakTime?: BreakReturnDTO;
}

export interface ScheduleOverviewDTO {
    currentRounds: RoundReturnDTO[];
    teamsNotInRound: Record<number, TeamReturnDTO[]>;
    scheduleCreated: boolean;
    finalScheduleCreated: boolean;
    numberOfRoundsUnplayed: number;
    tournamentOpen: boolean;
}

export interface GameReturnDTO {
    id: number;
    switchIndex: number;
    teams: TeamReturnDTO[];
    points: PointsReturnDTO[] | null;
}

export interface PointsReturnDTO {
    id: number;
    points: number;
    team: TeamReturnDTO;
}

export interface BreakReturnDTO {
    id: number;
    startTime: string;
    endTime: string;
    breakEnded: boolean;
    round?: RoundReturnDTO;
}

export interface TeamReturnDTO {
    id: number;
    teamName: string;
    character: CharacterReturnDTO;
    finalReady: boolean;
    active: boolean;
    groupPoints: number;
    finalPoints: number;
    numberOfGamesPlayed: number;
}

export interface TeamInputDTO {
    teamName: string;
    characterName: string;
    finalReady: boolean;
    active?: boolean;
}

export interface CharacterReturnDTO {
    id: number;
    characterName: string;
}

export interface RoundInputDTO {
    played: boolean;
}

export interface PointsInputDTO {
    points: number;
}

export interface BreakInputDTO {
    roundId: number;
    breakDuration: number;
    breakEnded: boolean;
}

export type SwitchTranslation = { name: string };

export interface SwitchDTO {
    name: string;
    color: string;
    translations?: Translations<SwitchTranslation>;
}

export interface TournamentDTO {
    tournamentOpen?: boolean;
    registrationOpen?: boolean;
    maxGamesCount?: number;
    surveyKeyMode?: SurveyKeyMode;
    finalTeamsCount?: number;
    switches?: SwitchDTO[];
    // JSON of the floor plan
    floorPlan?: string | null;
    // JSON of the programme
    program?: string | null;
    ocrProvider?: string | null;
    relativePoints?: boolean;
}

export interface OcrInputDTO {
    provider: string;
    image: string; // Base64 encoded image
}

export interface OcrCharacterDTO {
    name: string;
    points: number;
    place?: number | null;
}

export interface OcrReturnDTO {
    characters: OcrCharacterDTO[];
}

export interface ProviderInputDTO {
    model: string;
    thinking: string;
}

export interface ProviderReturnDTO {
    provider: string;
    model: string;
    thinking: string;
}

export interface ScheduleInputDTO {
    version: number;
    numFields: number;
    numRounds: number;
    teamsPerGame: number;
    teamsPerField?: number[];
}

export type QuestionTranslation = { questionText: string; options: string[] };

export interface QuestionInputDTO {
    questionText: string;
    questionType: QuestionType;
    options: string[];
    active: boolean;
    visible: boolean;
    live: boolean;
    finalTeamsOnly?: boolean;
    oneAnswerPerKey?: boolean;
    translations?: Translations<QuestionTranslation>;
}
export interface AnswerInputDTO {
    questionId: number;
    answerType: QuestionType;
    freeTextAnswer: string;
    multipleChoiceSelectedOption: number;
    checkboxSelectedOptions: number[];
    teamSelectedOption: number;
}

export interface QuestionReturnDTO {
    id: number;
    questionText: string;
    questionType: QuestionType;
    options: string[];
    active: boolean;
    visible: boolean;
    live: boolean;
    finalTeamsOnly: boolean;
    oneAnswerPerKey: boolean;
    translations?: Translations<QuestionTranslation>;
}

export interface AnswerReturnDTO {
    id: number;
    questionId: number;
    answerType: QuestionType;
    freeTextAnswer: string;
    multipleChoiceSelectedOption: number;
    checkboxSelectedOptions: number[];
    teamSelectedOption: number;
}

export interface AnswerCookieDTO {
    answerId: string;
}

export interface AuthenticationRequestDTO {
    username: string;
    password: string;
}

export interface AuthenticationResponseDTO {
    user: UserDTO;
}

export interface UserDTO {
    username: string;
    isAdmin: boolean;
    ID: number;
}

export interface NotificationSubscriptionDTO {
    endpoint: string;
    p256dh: string;
    auth: string;
    teamId: number;
    language: string;
}

export interface NotificationSubscriptionLanguageDTO {
    endpoint: string;
    language: string;
}

export type NotificationTranslation = { title: string; message: string };

export interface NotificationRequestDTO {
    title: string;
    message: string;
    translations?: Translations<NotificationTranslation>;
}
