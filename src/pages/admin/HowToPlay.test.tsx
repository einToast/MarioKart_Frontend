import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend } from '../../test/backend';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { renderWithRouter } from '../../test/render';
import { TournamentDTO } from '../../util/api/config/dto';
import { parseHowToPlay, serializeHowToPlay } from '../../util/layout/howToPlay';
import HowToPlay from './HowToPlay';

const SETTINGS_URL = '/public/settings';
const ADMIN_SETTINGS_URL = '/admin/settings';
const VIDEO = 'YouTube-Video:';

const renderPage = () => renderWithRouter(<HowToPlay />, { route: '/admin/how-to-play' });
const rules = () => screen.queryAllByLabelText(/^Regel \d+$/).map(input => (input as HTMLInputElement).value);
const savedHowToPlay = () => parseHowToPlay((backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body as TournamentDTO).howToPlay);
const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const stubHowToPlay = (videoUrl: string, texts: string[]) =>
    backend.get(SETTINGS_URL, { howToPlay: serializeHowToPlay({ videoUrl, rules: texts.map(text => ({ text })) }) });

describe('admin HowToPlay', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    itRequiresAnAdminSession(renderPage);

    it('starts from the default video and rules while none are stored', async () => {
        renderPage();

        await waitFor(() => expect(rules()).toHaveLength(8));
        expect(rules()).toContain('Die Geschwindigkeit beträgt 100 ccm');
        expect(screen.getByLabelText(VIDEO)).toHaveValue('https://www.youtube.com/watch?v=3p25Jjj6UGA');
    });

    it('saves edited, added and reordered rules with the video link', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        stubHowToPlay('', ['Fair bleiben', 'Spaß haben']);
        renderPage();
        await waitFor(() => expect(rules()).toEqual(['Fair bleiben', 'Spaß haben']));

        set('Regel 1', ' Immer fair bleiben ');
        fireEvent.click(screen.getByText('+ Regel hinzufügen'));
        set('Regel 3', '150 ccm');
        fireEvent.click(screen.getByLabelText('Regel 3 nach oben'));
        set(VIDEO, 'https://youtu.be/dQw4w9WgXcQ');
        fireEvent.click(screen.getByText('Speichern'));

        await expectSuccessToast('Spielregeln gespeichert');
        expect(savedHowToPlay()).toEqual({
            videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
            rules: [{ text: 'Immer fair bleiben' }, { text: '150 ccm' }, { text: 'Spaß haben' }],
        });
    });

    it('saves the default rules together with their English translation', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        stubHowToPlay('', ['Fair bleiben']);
        renderPage();
        await waitFor(() => expect(rules()).toEqual(['Fair bleiben']));

        fireEvent.click(screen.getByText('Standard-Regeln'));
        await waitFor(() => expect(rules()).toHaveLength(8));
        fireEvent.click(screen.getByText('Speichern'));

        await expectSuccessToast('Spielregeln gespeichert');
        expect(savedHowToPlay()?.rules[4]).toEqual({ text: 'Die Geschwindigkeit beträgt 100 ccm', translations: { en: { text: 'The speed is 100cc' } } });
    });

    it('removes a rule', async () => {
        stubHowToPlay('', ['Fair bleiben', 'Spaß haben']);
        renderPage();
        await waitFor(() => expect(rules()).toHaveLength(2));

        fireEvent.click(screen.getByLabelText('Regel 1 entfernen'));

        expect(rules()).toEqual(['Spaß haben']);
    });

    it.each([
        ['a link that is no YouTube video', () => set(VIDEO, 'https://vimeo.com/123'), 'Das ist kein YouTube-Link'],
        ['an empty rule', () => set('Regel 1', ' '), 'Jede Regel braucht einen Text'],
    ])('does not save %s', async (_name, change, message) => {
        stubHowToPlay('', ['Fair bleiben']);
        renderPage();
        await waitFor(() => expect(rules()).toHaveLength(1));

        change();
        fireEvent.click(screen.getByText('Speichern'));

        await expectErrorToast(message);
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)).toHaveLength(0);
    });
});
