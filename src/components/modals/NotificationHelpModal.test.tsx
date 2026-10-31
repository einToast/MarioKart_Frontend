import { fireEvent, render, screen } from '@testing-library/react';
import NotificationHelpModal from './NotificationHelpModal';

const IPHONE_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

describe('NotificationHelpModal', () => {
    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<NotificationHelpModal showModal={showModal} closeModal={closeModal} />);
        return { ...view, closeModal };
    };

    const selectTab = (value: string) => {
        fireEvent(document.querySelector('ion-segment') as Element, new CustomEvent('ionChange', { detail: { value } }));
    };

    const ANDROID_STEP = 'Öffne die Seite im Browser.';
    const IOS_STEP = 'Öffne die Seite in Safari und tippe auf das Teilen-Symbol.';

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('stays hidden while closed', () => {
        renderModal(false);

        expect(screen.queryByText('Android')).not.toBeInTheDocument();
    });

    it('offers a tab for Android and one for iPhone', () => {
        renderModal();

        expect(Array.from(document.querySelectorAll('ion-segment-button')).map(button => button.textContent)).toEqual([
            'Android', 'iPhone & iPad',
        ]);
    });

    it('opens on the Android tab outside of iOS', () => {
        renderModal();

        expect(screen.getByText(ANDROID_STEP)).toBeInTheDocument();
        expect(screen.queryByText(IOS_STEP)).not.toBeInTheDocument();
    });

    it('opens on the iPhone tab on iOS', () => {
        vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE_AGENT);
        renderModal();

        expect(screen.getByText(IOS_STEP)).toBeInTheDocument();
        expect(screen.queryByText(ANDROID_STEP)).not.toBeInTheDocument();
    });

    it('switches between the tabs', () => {
        renderModal();

        selectTab('ios');
        expect(screen.getByText(IOS_STEP)).toBeInTheDocument();
        expect(screen.queryByText(ANDROID_STEP)).not.toBeInTheDocument();

        selectTab('android');
        expect(screen.getByText(ANDROID_STEP)).toBeInTheDocument();
    });

    it('always shows the troubleshooting tips below the tabs', () => {
        renderModal();

        expect(screen.getByRole('heading', { level: 3, name: 'Es klappt nicht?' })).toBeInTheDocument();
        expect(screen.getByText(/ohne Google-Dienste/)).toBeInTheDocument();
        selectTab('ios');
        expect(screen.getByRole('heading', { level: 3, name: 'Es klappt nicht?' })).toBeInTheDocument();
        expect(screen.getByText(/erst ab iOS 16.4/)).toBeInTheDocument();
    });

    it('shows a described placeholder for every picture that is still missing', () => {
        renderModal();

        expect(screen.getAllByRole('img').map(placeholder => placeholder.getAttribute('aria-label'))).toEqual([
            'Berechtigungsabfrage des Browsers mit hervorgehobenem "Zulassen"-Button',
            'Seiteneinstellungen hinter dem Symbol neben der Adressleiste, Benachrichtigungen auf "Zulassen"',
            'Android-Einstellungen, App-Info des Browsers mit eingeschalteten Benachrichtigungen',
        ]);

        selectTab('ios');

        expect(screen.getAllByRole('img')).toHaveLength(5);
        expect(screen.getByText('Bild folgt: Safari mit hervorgehobenem Teilen-Symbol')).toBeInTheDocument();
    });

    it.each(['Enter', ' '])('closes with the "%s" key', (key) => {
        const { closeModal } = renderModal();

        fireEvent.keyDown(screen.getByText('Schließen').closest('ion-button') as Element, { key });

        expect(closeModal).toHaveBeenCalled();
    });

    it('closes on click', () => {
        const { closeModal } = renderModal();

        fireEvent.click(screen.getByText('Schließen'));

        expect(closeModal).toHaveBeenCalled();
    });
});
