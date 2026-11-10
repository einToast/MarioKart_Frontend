import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { TeamInputDTO, TeamReturnDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('PUBLIC', 'REGISTRATION');

export const registerTeam = async (team: TeamInputDTO): Promise<TeamReturnDTO> => {
    try {
        const response = await apiClient.post<TeamReturnDTO>(BASE_URL, team);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('errors.registrationClosed'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.characterNotFound'));
            } else if (error.response?.status === 400) {
                throw new Error(i18n.t('errors.characterRegistered'));
            } else {
                throw new Error(i18n.t('errors.registrationFailed'));
            }
        }
        throw error;
    }
};