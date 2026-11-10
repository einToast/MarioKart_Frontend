import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { BreakReturnDTO, RoundReturnDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'SCHEDULE');

export const getRounds = async (): Promise<RoundReturnDTO[]> => {
    try {
        const response = await apiClient.get<RoundReturnDTO[]>(`${BASE_URL}/rounds`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.roundsNotLoaded'));
            }
        }
        throw error;
    }
};

export const getRoundById = async (roundId: number): Promise<RoundReturnDTO> => {
    try {
        const response = await apiClient.get<RoundReturnDTO>(`${BASE_URL}/rounds/${roundId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.roundNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.roundNotLoaded'));
            }
        }
        throw error;
    }
};

export const getBreak = async (): Promise<BreakReturnDTO> => {
    try {
        const response = await apiClient.get<BreakReturnDTO>(`${BASE_URL}/break`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.breakNotLoaded'));
            }
        }
        throw error;
    }
};