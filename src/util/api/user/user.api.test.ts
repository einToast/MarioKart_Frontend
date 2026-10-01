import { AxiosError } from 'axios';
import { backend } from '../../../test/backend';
import { describeEndpoint } from '../../../test/endpoint';
import { PublicUserApi } from './index';

const session = { user: { username: 'admin', isAdmin: true, ID: 1 } };

describe('PublicUserApi', () => {
    describeEndpoint('login', {
        call: () => PublicUserApi.login({ username: 'admin', password: 'secret' }),
        method: 'POST',
        url: '/public/user/login',
        body: { username: 'admin', password: 'secret' },
        response: session,
        errors: { 401: 'Nutzername oder Passwort ist falsch' },
        fallback: 'Login fehlgeschlagen',
    });

    describeEndpoint('logout', {
        call: () => PublicUserApi.logout(),
        method: 'POST',
        url: '/public/user/logout',
        returnsVoid: true,
        fallback: 'Logout fehlgeschlagen',
    });

    describe('check', () => {
        it('sends GET /public/user/login/check and returns the session', async () => {
            backend.get('/public/user/login/check', session);

            await expect(PublicUserApi.check()).resolves.toEqual(session);
            expect(backend.requests).toEqual([{ method: 'GET', url: '/public/user/login/check', body: undefined }]);
        });

        it('translates HTTP 401 into "Login abgelaufen"', async () => {
            backend.fail('GET', '/public/user/login/check', 401);

            await expect(PublicUserApi.check()).rejects.toThrow(new Error('Login abgelaufen'));
        });

        it('passes every other axios error through untranslated', async () => {
            backend.fail('GET', '/public/user/login/check', 500);

            await expect(PublicUserApi.check()).rejects.toBeInstanceOf(AxiosError);
        });
    });
});
