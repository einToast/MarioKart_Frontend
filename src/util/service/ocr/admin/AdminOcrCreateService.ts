import { AdminOcrApi } from "../../../api";
import { OcrCharacterDTO } from "../../../api/config/dto";

const readAsBase64 = (image: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    // The result is a data URL, the backend expects only the part after the comma
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Foto konnte nicht gelesen werden'));
    reader.readAsDataURL(image);
});

// Reads the points of a game from a photo of its result screen. The characters are named like
// the characters of the teams
export const detectCharacters = async (roundId: number, gameId: number, provider: string, image: Blob): Promise<OcrCharacterDTO[]> => {
    const result = await AdminOcrApi.detectCharacters(roundId, gameId, { provider, image: await readAsBase64(image) });
    return result.characters ?? [];
}
