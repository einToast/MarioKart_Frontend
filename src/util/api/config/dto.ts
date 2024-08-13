

export interface RoundReturnDTO {
    id: number;
    startTime: string;
    endTime: string;
    finalGame: boolean;
    played: boolean;
    games?: GameReturnDTO[];

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

export interface TeamReturnDTO {
    id: number;
    teamName: string;
    character?: CharacterReturnDTO;
    finalReady: boolean;
    groupPoints: number;
    finalPoints: number;
    games?: GameReturnDTO[];
}

export interface TeamInputDTO {
    teamName: string;
    characterName: string;
    finalReady: boolean;
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

export interface UpdateUserDTO {

}
