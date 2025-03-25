import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamInputDTO, TeamReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('PUBLIC', 'REGISTRATION');

export const updateTeam = async (id: number, team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.put<TeamReturnDTO>(`${BASE_URL}/${id}`, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Team nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else if (error.response?.status === 400) {
                throw new Error('Charakter ist bereits vergeben');
            } else {
                throw new Error('Team konnte nicht aktualisiert werden');
            }
        }
        throw error;
    }
};