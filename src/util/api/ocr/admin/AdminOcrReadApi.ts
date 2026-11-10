import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { ProviderReturnDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'OCR');

export const getAvailableProviders = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<string[]>(`${BASE_URL}/available`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.providersNotLoaded'));
            }
        }
        throw error;
    }
};

export const getProviderModels = async (providerName: string): Promise<string[]> => {
    try {
        const response = await apiClient.get<string[]>(`${BASE_URL}/${providerName}/models`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.modelsNotLoaded'));
            }
        }
        throw error;
    }
};

export const getProviderConfig = async (providerName: string): Promise<ProviderReturnDTO> => {
    try {
        const response = await apiClient.get<ProviderReturnDTO>(`${BASE_URL}/${providerName}/config`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.providerConfigNotLoaded'));
            }
        }
        throw error;
    }
};
