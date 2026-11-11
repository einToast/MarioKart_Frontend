import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { OcrInputDTO, OcrReturnDTO } from '../../config/dto';
import i18n from "../../../../i18n";

const BASE_URL = ApiPath.createPath('ADMIN', 'OCR');

export const detectCharacters = async (roundId: number, gameId: number, input: OcrInputDTO): Promise<OcrReturnDTO> => {
    try {
        const response = await apiClient.post<OcrReturnDTO>(`${BASE_URL}/${roundId}/${gameId}`, input);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error(i18n.t('errors.gameNotFound'));
            } else if (error.response?.status === 401) {
                throw new Error(i18n.t('errors.unauthorized'));
            } else {
                throw new Error(i18n.t('errors.photoNotEvaluated'));
            }
        }
        throw error;
    }
};
