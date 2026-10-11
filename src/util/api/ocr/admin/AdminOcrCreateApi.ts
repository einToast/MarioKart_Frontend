import axios from 'axios';
import apiClient, { ApiPath } from "../../config/apiClient";
import { OcrInputDTO, OcrReturnDTO } from '../../config/dto';

// TODO:The backend serves its OCR controllers below the public path
const BASE_URL = ApiPath.createPath('PUBLIC', 'OCR');

export const detectCharacters = async (roundId: number, gameId: number, input: OcrInputDTO): Promise<OcrReturnDTO> => {
    try {
        const response = await apiClient.post<OcrReturnDTO>(`${BASE_URL}/${roundId}/${gameId}`, input);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Spiel nicht gefunden');
            } else if (error.response?.status === 401) {
                throw new Error('Nicht autorisierter Zugriff');
            } else {
                throw new Error('Foto konnte nicht ausgewertet werden');
            }
        }
        throw error;
    }
};
