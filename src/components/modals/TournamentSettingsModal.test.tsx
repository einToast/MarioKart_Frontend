import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { expectErrorToast } from '../../test/overlays';
import { getBaseLanguage } from '../../i18n/languages';
import TournamentSettingsModal from './TournamentSettingsModal';

const SETTINGS_URL = '/public/settings';
const ADMIN_SETTINGS_URL = '/admin/settings';
const ROUND_MINUTES = 'Spielzeit pro Runde (Minuten):';
const HIDDEN_ROUNDS = 'Rangliste in den letzten Runden ausblenden:';
const ANSWERS = 'Antworten pro Team und Frage:';
const KEY_DAYS = 'Umfrageschlüssel gültig (Tage):';
const defaultLanguageToggle = () => screen.getByRole('button', { name: /^Standardsprache: / });
const chooseDefaultLanguage = (name: string) => {
    fireEvent.click(defaultLanguageToggle());
    fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));
};
const INVALID_NUMBERS = 'Spielzeit, Antworten und Gültigkeit brauchen mindestens 1, ausgeblendete Runden mindestens 0';

const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const renderModal = (showModal = true) => {
    const closeModal = vi.fn();
    const view = render(<TournamentSettingsModal showModal={showModal} closeModal={closeModal} />);
    return { ...view, closeModal };
};

const renderLoaded = async () => {
    const view = renderModal();
    await waitFor(() => expect(screen.getByLabelText(ROUND_MINUTES)).toHaveValue(20));
    return view;
};

describe('TournamentSettingsModal', () => {
    beforeEach(() => {
        backend.get(SETTINGS_URL, { roundMinutes: 20, rankingHiddenRounds: 1, maxAnswersPerTeam: 4, surveyKeyDays: 2, defaultLanguage: 'de' });
    });

    it('stays hidden and loads nothing while closed', () => {
        renderModal(false);

        expect(screen.queryByText('Turniereinstellungen')).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it('shows the stored settings', async () => {
        await renderLoaded();

        expect(screen.getByLabelText(HIDDEN_ROUNDS)).toHaveValue(1);
        expect(screen.getByLabelText(ANSWERS)).toHaveValue(4);
        expect(screen.getByLabelText(KEY_DAYS)).toHaveValue(2);
        expect(defaultLanguageToggle()).toHaveAccessibleName('Standardsprache: Deutsch');
    });

    it('switches the default language for the whole app once saved', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        const { closeModal } = await renderLoaded();

        chooseDefaultLanguage('English');
        expect(getBaseLanguage()).toBe('de');
        fireEvent.click(screen.getByText('Speichern'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ settingsChanged: true }));
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body).toMatchObject({ defaultLanguage: 'en' });
        expect(getBaseLanguage()).toBe('en');
    });

    it('keeps the default language when saving fails', async () => {
        backend.fail('PUT', ADMIN_SETTINGS_URL, 400);
        await renderLoaded();

        chooseDefaultLanguage('English');
        fireEvent.click(screen.getByText('Speichern'));

        await expectErrorToast('Ungültige Einstellungen');
        expect(getBaseLanguage()).toBe('de');
    });

    it('saves the changed settings and reports the change', async () => {
        backend.put(ADMIN_SETTINGS_URL, {});
        const { closeModal } = await renderLoaded();

        set(ROUND_MINUTES, '25');
        set(HIDDEN_ROUNDS, '0');
        set(ANSWERS, '6');
        set(KEY_DAYS, '400');
        fireEvent.click(screen.getByText('Speichern'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ settingsChanged: true }));
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body)
            .toEqual({ roundMinutes: 25, rankingHiddenRounds: 0, maxAnswersPerTeam: 6, surveyKeyDays: 400, defaultLanguage: 'de' });
    });

    it.each([
        [ROUND_MINUTES, '0', INVALID_NUMBERS],
        [HIDDEN_ROUNDS, '-1', INVALID_NUMBERS],
        [ANSWERS, '', INVALID_NUMBERS],
        [KEY_DAYS, '401', 'Umfrageschlüssel können höchstens 400 Tage gültig sein'],
    ])('does not save %s = "%s"', async (label, value, message) => {
        const { closeModal } = await renderLoaded();

        set(label, value);
        fireEvent.click(screen.getByText('Speichern'));

        await expectErrorToast(message);
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)).toHaveLength(0);
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('stays open and shows the error when the settings cannot be stored', async () => {
        backend.fail('PUT', ADMIN_SETTINGS_URL, 400);
        const { closeModal } = await renderLoaded();

        fireEvent.click(screen.getByText('Speichern'));

        await expectErrorToast('Ungültige Einstellungen');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('closes without a change on cancel', async () => {
        const { closeModal } = await renderLoaded();

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ settingsChanged: false });
        expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)).toHaveLength(0);
    });
});
