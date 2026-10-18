import { GamePhoto } from '../../../api/config/interfaces';
// The photos are kept outside of the components, so they stay available for comparing
// until the page is reloaded
const photos = new Map<number, GamePhoto>();

export const getGamePhoto = (gameId: number): GamePhoto | undefined => photos.get(gameId);

export const setGamePhoto = (gameId: number, file: File): GamePhoto => {
    const previous = photos.get(gameId);
    if (previous) {
        URL.revokeObjectURL(previous.url);
    }

    const photo = { file, url: URL.createObjectURL(file) };
    photos.set(gameId, photo);
    return photo;
}

export const clearGamePhotos = (): void => {
    photos.forEach(photo => URL.revokeObjectURL(photo.url));
    photos.clear();
}
