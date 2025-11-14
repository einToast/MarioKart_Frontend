import { PublicUserApi } from "../../../api";
import { AuthenticationRequestDTO, AuthenticationResponseDTO } from "../../../api/config/dto";

export const login = async (username: string, password: string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    await PublicUserApi.login(user);
};

export const logout = async (): Promise<void> => {
    await PublicUserApi.logout();
};

export const check = async (): Promise<AuthenticationResponseDTO> => {
    return PublicUserApi.check();
};
