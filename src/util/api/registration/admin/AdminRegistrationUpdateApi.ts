import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamInputDTO, TeamReturnDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'REGISTRATION');

export const updateTeam = async (id: number, team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.put<TeamReturnDTO>(`${BASE_URL}/${id}`, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.teamNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.characterTaken'));
            } else {
                throw new Error(i18n.t('errors.teamNotUpdated'));
            }
        }
        throw error;
    }
};

export const resetEveryTeamFinalParticipation = async (): Promise<TeamReturnDTO[]> => {
    try {
        const response = await apiClient.put<TeamReturnDTO[]>(`${BASE_URL}/finalParticipation/reset`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.teamsNotReset'));
            }
        }
        throw error;
    }
}