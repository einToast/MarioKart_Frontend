import Cookies from 'js-cookie';
import { backend } from '../../../test/backend';
import { makeUser } from '../../../test/fixtures';
import { PublicCookiesService } from './index';

const ONE_DAY_STRICT_SECURE = { expires: 1, sameSite: 'strict', secure: true };

describe('PublicCookiesService', () => {
    describe('user', () => {
        it('stores the user and reads it back', () => {
            const user = makeUser({ teamId: 7, name: 'Team Yoshi', character: 'Yoshi' });

            PublicCookiesService.setUser(user);

            expect(PublicCookiesService.getUser()).toEqual(user);
        });

        it('stores the user as a strict, secure cookie that expires after one day', () => {
            const set = vi.spyOn(Cookies, 'set');
            const user = makeUser();

            PublicCookiesService.setUser(user);

            expect(set).toHaveBeenCalledWith('user', JSON.stringify(user), ONE_DAY_STRICT_SECURE);
        });

        it('returns an object without a teamId when nobody is logged in', () => {
            expect(PublicCookiesService.getUser()?.teamId).toBeUndefined();
        });

        it('returns null when the cookie is not valid JSON', () => {
            Cookies.set('user', 'not json');

            expect(PublicCookiesService.getUser()).toBeNull();
        });

        it('forgets the user on removeUser', () => {
            PublicCookiesService.setUser(makeUser());

            PublicCookiesService.removeUser();

            expect(Cookies.get('user')).toBeUndefined();
            expect(PublicCookiesService.getUser()?.teamId).toBeUndefined();
        });
    });

    describe('selected games option', () => {
        it('returns null when nothing was selected yet', () => {
            expect(PublicCookiesService.getSelectedGamesOption()).toBeNull();
        });

        it('stores the selection and reads it back', () => {
            PublicCookiesService.setSelectedGamesOption('Alle Spiele');

            expect(PublicCookiesService.getSelectedGamesOption()).toBe('Alle Spiele');
        });

        it('stores the selection as a strict, secure cookie that expires after one day', () => {
            const set = vi.spyOn(Cookies, 'set');

            PublicCookiesService.setSelectedGamesOption('Alle Spiele');

            expect(set).toHaveBeenCalledWith('selectedGamesOption', 'Alle Spiele', ONE_DAY_STRICT_SECURE);
        });
    });

    describe('notifications enabled', () => {
        it('defaults to false', () => {
            expect(PublicCookiesService.getNotificationsEnabled()).toBe(false);
        });

        it.each([true, false])('stores %s and reads it back', (enabled) => {
            PublicCookiesService.setNotificationsEnabled(enabled);

            expect(PublicCookiesService.getNotificationsEnabled()).toBe(enabled);
        });

        it('returns false when the cookie is not valid JSON', () => {
            Cookies.set('notificationsEnabled', 'yes please');

            expect(PublicCookiesService.getNotificationsEnabled()).toBe(false);
        });
    });

    describe('checkToken', () => {
        it('resolves to true while the admin session is valid', async () => {
            backend.get('/public/user/login/check', { user: { username: 'admin', isAdmin: true, ID: 1 } });

            await expect(PublicCookiesService.checkToken()).resolves.toBe(true);
        });

        it('resolves to false when the session has expired', async () => {
            backend.fail('GET', '/public/user/login/check', 401);

            await expect(PublicCookiesService.checkToken()).resolves.toBe(false);
        });

        it('resolves to false when the backend is unreachable', async () => {
            backend.networkError('GET', '/public/user/login/check');

            await expect(PublicCookiesService.checkToken()).resolves.toBe(false);
        });
    });
});
