import characters from './characters';

// Vite resolves the glob at transform time; only the file names are needed here
const avatarFiles = Object.keys(import.meta.glob('/public/characters/*.png'));

describe('characters', () => {
    it('lists every character only once', () => {
        expect(new Set(characters).size).toBe(characters.length);
    });

    it.each(characters)('has an avatar image for %s', (character) => {
        expect(avatarFiles).toContain(`/public/characters/${character}.png`);
    });
});
