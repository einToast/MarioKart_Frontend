// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import Cookies from 'js-cookie';
import { backend } from './test/backend';
import { resetCharts } from './test/charts';
import { resetStomp } from './test/stomp';
import apiClient from './util/api/config/apiClient';
import i18n from './i18n';
import { DEFAULT_LANGUAGE } from './i18n/languages';

// The WebSocket layer would otherwise open a real SockJS connection as soon as it is imported
vi.mock('@stomp/stompjs', async () => await import('./test/stomp'));
vi.mock('sockjs-client', () => ({ default: vi.fn() }));

vi.mock('./util/service/websockets/reloadDelay', () => ({ MAX_RELOAD_DELAY_MS: 1000, reloadDelay: vi.fn(() => 0) }));

// The two overlays are the only Ionic components that are replaced, see test/overlays.tsx for
// the reasons. Everything else is the real Ionic component
vi.mock('@ionic/react', async (importOriginal) => {
    const { FakeIonModal, FakeIonToast } = await import('./test/overlays');
    return {
        ...(await importOriginal<typeof import('@ionic/react')>()),
        IonModal: FakeIonModal,
        IonToast: FakeIonToast,
    };
});

// chart.js needs a real canvas; the graphs are tested through the props they pass to <Bar>
vi.mock('react-chartjs-2', async () => await import('./test/charts'));

// Every request the app makes goes to the in-memory backend in test/backend.ts
apiClient.defaults.adapter = backend.adapter;

// Mock matchmedia
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () { },
    removeListener: function () { }
  };
};

const originalLocation = Object.getOwnPropertyDescriptor(window, 'location');

beforeEach(() => {
  backend.reset();
});

afterEach(() => {
  const unhandled = backend.unhandled.map(request => `${request.method} ${request.url}`);

  for (const name of Object.keys(Cookies.get())) {
    Cookies.remove(name);
  }
  if (originalLocation) {
    Object.defineProperty(window, 'location', originalLocation);
  }
  document.body.className = '';
  resetStomp();
  resetCharts();
  vi.useRealTimers();
  void i18n.changeLanguage(DEFAULT_LANGUAGE);

  // A request without a stubbed route means the test does not control what the app sees
  expect(unhandled, 'requests without a fake backend route').toEqual([]);
});
