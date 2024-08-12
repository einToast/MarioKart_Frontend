import {login} from "../api/UserApi";
import {jwtDecode} from 'jwt-decode';
import {
    AuthenticationRequestDTO,
    AuthenticationResponseDTO,
    RoundReturnDTO,
    TeamInputDTO,
    TeamReturnDTO
} from "../api/config/dto";
import {getTeamsSortedByFinalPoints, updateTeam} from "../api/RegistrationApi";
import {createFinalPlan, createMatchPlan} from "../api/MatchPlanApi";


export const getTeamFinalRanked = async (): Promise<TeamReturnDTO[]> => {
    const response = (await getTeamsSortedByFinalPoints())
        .filter(team => team.finalReady)
        .slice(0, 4);
    return response;
}

export const removeTeamFinalParticipation = async (team: TeamReturnDTO): Promise<TeamReturnDTO> => {
    const teamInput: TeamInputDTO = {
        teamName: team.teamName,
        characterName: team.character.characterName,
        finalReady: false,
    }

    try {
        return await updateTeam(team.id, teamInput);
    } catch (error) {
        console.error('Error updating team:', error);
        throw error;
    }
}

export const resetAllTeamFinalParticipation = async (): Promise<TeamReturnDTO[]> => {
    const teams = await getTeamsSortedByFinalPoints();
    const updatedTeams: TeamReturnDTO[] = [];

    for (const team of teams) {
        if (!team.finalReady) {
            continue;
        }
        const teamInput: TeamInputDTO = {
            teamName: team.teamName,
            characterName: team.character.characterName,
            finalReady: true,
        }
        try {
            updatedTeams.push(await updateTeam(team.id, teamInput));
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    }

    return updatedTeams;
}

export const createTeamMatchPlan = async (): Promise<RoundReturnDTO[]> => {
    const response = await createMatchPlan();
    return response;
}

export const createTeamFinalPlan = async (): Promise<RoundReturnDTO[]> => {
    const response = await createFinalPlan();
    return response;
}

export const loginUser = async (username:string, password:string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    const response = await login(user);
    setToken(response.accessToken);
};

export const setToken = (token: string): void => {
    localStorage.setItem('authToken', token);
};

export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const removeToken = (): void => {
    localStorage.removeItem('authToken');
};

const isTokenExpired = (token: string): boolean => {
    const decodedToken = jwtDecode(token);
    const expirationTimeInSeconds = decodedToken.exp;

    if (!expirationTimeInSeconds) {
        return true;
    }

    const currentDateTime = new Date().getTime() / 1000;

    return expirationTimeInSeconds < currentDateTime;
}

export const checkToken = (): boolean => {
    const token = getToken();
    if (!token) {
        removeToken();
        return false;
    }
    if (isTokenExpired(token)) {
        removeToken();
        return false;
    }
    return true;
}