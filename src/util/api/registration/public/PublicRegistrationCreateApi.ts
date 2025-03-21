import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamInputDTO, TeamReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'REGISTRATION');

export const registerTeam = async (team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.post<TeamReturnDTO>(BASE_URL, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error('Registrierung ist nicht möglich');
            } else if (error.response?.status === 404) {
                throw new Error('Charakter nicht gefunden');
            } else if (error.response?.status === 400) {
                throw new Error('Charakter schon registriert');
            }
        }
        throw error;
    }
};