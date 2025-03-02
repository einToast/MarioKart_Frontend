import { QuestionType } from "../../service/util";


export interface RoundReturnDTO {
    id: number;
    startTime: string;
    endTime: string;
    finalGame: boolean;
    played: boolean;
    games?: GameReturnDTO[];
    breakTime?: BreakReturnDTO;
}

export interface GameReturnDTO {
    id: number;
    switchGame: string;
    round?: RoundReturnDTO;
    teams?: TeamReturnDTO[];
    points?: PointsReturnDTO[];
}

export interface PointsReturnDTO {
    id: number;
    points: number;
    team?: TeamReturnDTO;
    game?: GameReturnDTO;

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
    character?: CharacterReturnDTO;
    finalReady: boolean;
    active: boolean;
    groupPoints: number;
    finalPoints: number;
    games?: GameReturnDTO[];
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
    team?: TeamReturnDTO;

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

export interface TournamentDTO {
    tournamentOpen?: boolean;
    registrationOpen?: boolean;
}

export interface QuestionInputDTO {
    questionText: string;
    questionType: QuestionType;
    options: string[];
    active: boolean;
    visible: boolean;
    live: boolean;
}
export interface AnswerInputDTO {
    questionId: number;
    answerType: QuestionType;
    freeTextAnswer: string;
    multipleChoiceSelectedOption: number;
    checkboxSelectedOptions: number[];
}

export interface QuestionReturnDTO {
    id: number;
    questionText: string;
    questionType: QuestionType;
    options: string[];
    active: boolean;
    visible: boolean;
    live: boolean;
}

export interface AnswerReturnDTO {
    questionId: number;
    answerType: QuestionType;
    freeTextAnswer: string;
    multipleChoiceSelectedOption: number;
    checkboxSelectedOptions: number[];
}

export interface AnswerCookieDTO {
    answerId: string;
}

export interface AuthenticationRequestDTO {
    username: string;
    password: string;

}

export interface AuthenticationResponseDTO {
    accessToken: string;
    user: UserDTO;

}

export interface UserDTO {
    username: string;
    isAdmin: boolean;
    ID: number;

}

export interface UserPasswordsDTO {
    password: string;
    passwordConfirm: string;

}

export interface UserTokenDTO {
    token: string;
    expiresAt: string;
    user: UserDTO;

}

export interface UserCreationDTO {
    username: string;
    isAdmin: boolean;

}

export type UpdateUserDTO = object;

