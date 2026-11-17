import { render, waitFor } from '@testing-library/react';
import { backend } from '../test/backend';
import { stompClient } from '../test/stomp';
import { getBaseLanguage } from '../i18n/languages';
import BaseLanguageSync from './BaseLanguageSync';
import { WebSocketProvider } from './WebSocketContext';

describe('BaseLanguageSync', () => {
    it('takes over a default language the admin changed while the app is open', async () => {
        render(<WebSocketProvider><BaseLanguageSync /></WebSocketProvider>);
        stompClient().simulateConnect();
        await waitFor(() => expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/settings', expect.any(Function)), { timeout: 2000 });
        backend.get('/public/settings', { defaultLanguage: 'en' });

        const onMessage = stompClient().subscribe.mock.calls.find(call => call[0] === '/topic/settings')?.[1] as () => void;
        onMessage();

        await waitFor(() => expect(getBaseLanguage()).toBe('en'), { timeout: 2000 });
    });
});
