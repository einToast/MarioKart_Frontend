import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { ProviderInputDTO, ProviderReturnDTO } from '../../config/dto';

const BASE_URL = ApiPath.createPath('ADMIN', 'OCR');

export const updateProviderConfig = async (providerName: string, config: ProviderInputDTO): Promise<ProviderReturnDTO> => {
    try {
        const response = await apiClient.put<ProviderReturnDTO>(`${BASE_URL}/${providerName}/config`, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Konfiguration des Anbieters konnte nicht gespeichert werden');
            }
        }
        throw error;
    }
};
