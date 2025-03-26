import { PublicCookiesService } from "../..";
import { PublicUserApi } from "../../../api";
import { AuthenticationRequestDTO } from "../../../api/config/dto";

export const login = async (username: string, password: string): Promise<void> => {
    const user: AuthenticationRequestDTO = {
        username: username,
        password: password
    }
    const response = await PublicUserApi.login(user);
    PublicCookiesService.setToken(response.accessToken);
};