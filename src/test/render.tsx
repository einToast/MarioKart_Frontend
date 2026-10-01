import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import Cookies from 'js-cookie';
import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { expect, vi } from 'vitest';
import { WebSocketProvider } from '../components/WebSocketContext';
import { User } from '../util/api/config/interfaces';
import { makeUser } from './fixtures';

const LocationProbe: React.FC = () => {
    const location = useLocation();
    return <span data-testid="location">{location.pathname}</span>;
};

// Hosts a page, component or hook the way App.tsx does: inside the WebSocket provider and
// mounted on its own route only. The pages reload their data on every location change, so one
// that stayed mounted after navigating away would redirect forever. The current route is
// exposed through `currentPath()`
export const createAppWrapper = (route = '/'): React.FC<{ children: React.ReactNode }> => {
    const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <WebSocketProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path={route} element={children} />
                    <Route path="*" element={null} />
                </Routes>
                <LocationProbe />
            </MemoryRouter>
        </WebSocketProvider>
    );
    return AppWrapper;
};

export const renderWithRouter = (ui: React.ReactElement, { route = '/' }: { route?: string } = {}): RenderResult =>
    render(ui, { wrapper: createAppWrapper(route) });

export const currentPath = (): string | null => screen.getByTestId('location').textContent;

// Writes the `user` cookie the app uses to remember which team is logged in
export const loginAsTeam = (overrides: Partial<User> = {}): User => {
    const user = makeUser(overrides);
    Cookies.set('user', JSON.stringify(user));
    return user;
};

// Clicks an IonButton (or any clickable wrapper) through the text it contains
export const clickText = (text: string | RegExp): void => {
    fireEvent.click(screen.getByText(text));
};

// The ion-button element around a label, for asserting on its `disabled` property
export const buttonOf = (text: string | RegExp): HTMLIonButtonElement => {
    const button = screen.getByText(text).closest('ion-button');
    expect(button).not.toBeNull();
    return button as HTMLIonButtonElement;
};

// Fires the pull-to-refresh event and returns the `complete` callback Ionic would pass along
export const pullToRefresh = (container: HTMLElement): ReturnType<typeof vi.fn> => {
    const refresher = container.querySelector('ion-refresher');
    expect(refresher).not.toBeNull();
    const complete = vi.fn();
    fireEvent(refresher as Element, new CustomEvent('ionRefresh', { detail: { complete } }));
    return complete;
};

// Replaces `window.location` for the current test so `location.assign` (a full page navigation
// jsdom cannot perform) can be observed. setupTests.ts restores the original afterwards
export const stubLocationAssign = (): ReturnType<typeof vi.fn> => {
    const assign = vi.fn();
    const { origin, href, pathname, search, hash, host, hostname, protocol, port } = window.location;
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: { origin, href, pathname, search, hash, host, hostname, protocol, port, assign },
    });
    return assign;
};
