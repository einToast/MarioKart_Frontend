import { reloadOnServiceWorkerUpdate } from './reloadOnUpdate';

describe('reloadOnServiceWorkerUpdate', () => {
    let serviceWorker: EventTarget & { controller: object | null };
    let reload: ReturnType<typeof vi.fn>;

    const setUp = (controller: object | null) => {
        serviceWorker = Object.assign(new EventTarget(), { controller });
        Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: serviceWorker });
        reload = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, reload },
        });
    };

    const takeControl = () => serviceWorker.dispatchEvent(new Event('controllerchange'));

    const originalLocation = window.location;

    afterEach(() => {
        Reflect.deleteProperty(navigator, 'serviceWorker');
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    });

    it('reloads once when a new version takes control of the page', () => {
        setUp({});
        reloadOnServiceWorkerUpdate();

        takeControl();
        takeControl();

        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload when the first service worker takes control', () => {
        setUp(null);
        reloadOnServiceWorkerUpdate();

        takeControl();

        expect(reload).not.toHaveBeenCalled();
    });

    it('does nothing in browsers without service workers', () => {
        Reflect.deleteProperty(navigator, 'serviceWorker');

        expect(() => reloadOnServiceWorkerUpdate()).not.toThrow();
    });
});
