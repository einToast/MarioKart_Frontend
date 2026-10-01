import { waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { backend, stubLoggedOutAdmin } from './backend';
import { stubLocationAssign } from './render';

// Every admin page checks the session itself instead of relying on a route guard. This adds the
// test for that check: without a session the page must leave for the admin login and must not
// request any admin data
export const itRequiresAnAdminSession = (
    renderPage: () => unknown,
    // Public endpoints that child components load on mount, independent of the session
    { unguardedRequests = [] }: { unguardedRequests?: string[] } = {}
): void => {
    it('sends visitors without an admin session to the admin login and loads nothing', async () => {
        stubLoggedOutAdmin();
        const assign = stubLocationAssign();

        renderPage();

        await waitFor(() => expect(assign).toHaveBeenCalledWith('/admin/login'));
        const guarded = backend.requests.map(request => request.url).filter(url => !unguardedRequests.includes(url));
        expect(guarded).toEqual(['/public/user/login/check']);
    });
};
