import { backend } from '../../../test/backend';
import { PublicUserService } from './index';

const session = { user: { username: 'admin', isAdmin: true, ID: 1 } };

describe('PublicUserService', () => {
    it('login sends the credentials and resolves without a value', async () => {
        backend.post('/public/user/login', session);

        await expect(PublicUserService.login('admin', 'secret')).resolves.toBeUndefined();
        expect(backend.requests).toEqual([{
            method: 'POST',
            url: '/public/user/login',
            body: { username: 'admin', password: 'secret' },
        }]);
    });

    it('login rejects wrong credentials', async () => {
        backend.fail('POST', '/public/user/login', 401);

        await expect(PublicUserService.login('admin', 'falsch')).rejects.toThrow('Nutzername oder Passwort ist falsch');
    });

    it('logout ends the session', async () => {
        backend.post('/public/user/logout');

        await PublicUserService.logout();

        expect(backend.requests).toEqual([{ method: 'POST', url: '/public/user/logout', body: undefined }]);
    });

    it('logout rejects when the backend cannot end the session', async () => {
        backend.fail('POST', '/public/user/logout', 500);

        await expect(PublicUserService.logout()).rejects.toThrow('Logout fehlgeschlagen');
    });

    it('check returns the current session', async () => {
        backend.get('/public/user/login/check', session);

        await expect(PublicUserService.check()).resolves.toEqual(session);
    });

    it('check rejects an expired session', async () => {
        backend.fail('GET', '/public/user/login/check', 401);

        await expect(PublicUserService.check()).rejects.toThrow('Login abgelaufen');
    });
});
