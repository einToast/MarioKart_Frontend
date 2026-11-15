import { DEFAULT_VIDEO_URL, defaultHowToPlay, parseHowToPlay, serializeHowToPlay, youtubeEmbedUrl } from './howToPlay';

describe('youtubeEmbedUrl', () => {
    it.each([
        'https://www.youtube.com/watch?v=3p25Jjj6UGA',
        'https://youtube.com/watch?feature=share&v=3p25Jjj6UGA',
        'https://m.youtube.com/watch?v=3p25Jjj6UGA&t=10',
        'https://youtu.be/3p25Jjj6UGA?si=c4boLd7F1PqX2A7c',
        'https://www.youtube.com/embed/3p25Jjj6UGA',
        'https://www.youtube.com/shorts/3p25Jjj6UGA',
        ' youtube.com/watch?v=3p25Jjj6UGA ',
    ])('embeds %s', (url) => {
        expect(youtubeEmbedUrl(url)).toBe('https://www.youtube.com/embed/3p25Jjj6UGA');
    });

    it.each([
        '',
        'https://vimeo.com/123456789',
        'https://www.youtube.com/watch?v=tooShort',
        'https://evil.example/youtube.com/watch?v=3p25Jjj6UGA',
        'javascript:alert(1)',
    ])('refuses to embed "%s"', (url) => {
        expect(youtubeEmbedUrl(url)).toBeNull();
    });
});

describe('parseHowToPlay', () => {
    it.each([null, undefined, '', 'not json', '{"videoUrl":"x"}', 'null'])('returns null for %s', (json) => {
        expect(parseHowToPlay(json)).toBeNull();
    });

    it('drops broken rules and a video link that is no text', () => {
        const json = JSON.stringify({ videoUrl: 42, rules: [{ text: 'Fair bleiben' }, { text: 7 }, 'loose', { text: 'Spaß haben', translations: { en: { text: 'Have fun' } } }] });

        expect(parseHowToPlay(json)).toEqual({
            videoUrl: '',
            rules: [{ text: 'Fair bleiben' }, { text: 'Spaß haben', translations: { en: { text: 'Have fun' } } }],
        });
    });

    it('reads what serializeHowToPlay wrote, without empty translations', () => {
        const json = serializeHowToPlay({
            videoUrl: 'https://youtu.be/3p25Jjj6UGA',
            rules: [{ text: 'Fair bleiben', translations: { en: { text: ' ' } } }],
        });

        expect(parseHowToPlay(json)).toEqual({ videoUrl: 'https://youtu.be/3p25Jjj6UGA', rules: [{ text: 'Fair bleiben' }] });
    });
});

describe('defaultHowToPlay', () => {
    it('offers the default video and the German rules with their English translation', async () => {
        const howToPlay = await defaultHowToPlay();

        expect(howToPlay.videoUrl).toBe(DEFAULT_VIDEO_URL);
        expect(howToPlay.rules).toHaveLength(8);
        expect(howToPlay.rules[4]).toEqual({
            text: 'Die Geschwindigkeit beträgt 100 ccm',
            translations: { en: { text: expect.stringContaining('100cc') } },
        });
    });
});
