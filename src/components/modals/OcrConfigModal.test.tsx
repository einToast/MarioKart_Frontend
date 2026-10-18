import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { buttonOf } from '../../test/render';
import OcrConfigModal from './OcrConfigModal';

const SAVE = 'Konfiguration speichern';
const OCR_URL = '/admin/ocr';
const SETTINGS_URL = '/admin/settings';

const fill = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });
const fieldBelow = (label: string) => (screen.getByText(label).parentElement as HTMLElement).querySelector('select, input') as HTMLSelectElement;
const optionsOf = (label: string) => Array.from(fieldBelow(label).options).map(option => option.textContent);
const relativePointsCheckbox = () => document.querySelector('ion-checkbox') as HTMLIonCheckboxElement;

const renderModal = (showModal = true) => {
    const closeModal = vi.fn();
    const view = render(<OcrConfigModal showModal={showModal} closeModal={closeModal} />);
    return { ...view, closeModal };
};

describe('OcrConfigModal', () => {
    beforeEach(() => {
        backend
            .get(`${OCR_URL}/available`, ['gemini', 'openai'])
            .get(`${OCR_URL}/gemini/config`, { provider: 'gemini', model: 'gemini-3.8-flash', thinking: 'minimal' })
            .get(`${OCR_URL}/gemini/models`, ['gemini-3.8-flash', 'gemini-3.8-pro'])
            .get(`${OCR_URL}/openai/config`, { provider: 'openai', model: 'gpt-6.1-sol', thinking: 'xhigh' })
            .get(`${OCR_URL}/openai/models`, ['gpt-6.1-luna'])
            .get('/public/settings', { ocrProvider: 'gemini', relativePoints: false });
    });

    it('stays hidden and loads nothing while closed', () => {
        renderModal(false);

        expect(screen.queryByText('Punkteerkennung')).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it('shows the configuration of the first available provider', async () => {
        renderModal();

        await waitFor(() => expect(optionsOf('Modell')).toEqual(['gemini-3.8-flash', 'gemini-3.8-pro']));
        expect(optionsOf('Anbieter')).toEqual(['gemini (Standard)', 'openai']);
        expect(fieldBelow('Anbieter')).toHaveValue('gemini');
        expect(fieldBelow('Modell')).toHaveValue('gemini-3.8-flash');
        expect(fieldBelow('Denkaufwand')).toHaveValue('minimal');
    });

    it('opens on the standard provider and shows the stored relative points', async () => {
        backend.get('/public/settings', { ocrProvider: 'openai', relativePoints: true });
        renderModal();

        await waitFor(() => expect(fieldBelow('Anbieter')).toHaveValue('openai'));
        expect(optionsOf('Anbieter')).toEqual(['gemini', 'openai (Standard)']);
        expect(buttonOf('Standard-Anbieter').disabled).toBe(true);
        expect(relativePointsCheckbox().checked).toBe(true);
    });

    it('falls back to the first provider when the standard provider is not available', async () => {
        backend.get('/public/settings', { ocrProvider: 'mistral' });
        renderModal();

        await waitFor(() => expect(optionsOf('Modell')).toHaveLength(2));
        expect(fieldBelow('Anbieter')).toHaveValue('gemini');
        expect(optionsOf('Anbieter')).toEqual(['gemini (Standard)', 'openai']);
    });

    it('makes the selected provider the standard provider right away', async () => {
        backend.put(SETTINGS_URL, {});
        const { closeModal } = renderModal();
        await waitFor(() => expect(optionsOf('Anbieter')).toHaveLength(2));

        fill(fieldBelow('Anbieter'), 'openai');
        fireEvent.click(screen.getByText('Als Standard festlegen'));

        await expectSuccessToast('Standard-Anbieter gespeichert');
        expect(backend.requestsTo('PUT', SETTINGS_URL)[0].body).toEqual({ ocrProvider: 'openai' });
        expect(optionsOf('Anbieter')).toEqual(['gemini', 'openai (Standard)']);
        expect(buttonOf('Standard-Anbieter').disabled).toBe(true);
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('keeps the standard provider when it cannot be saved', async () => {
        backend.fail('PUT', SETTINGS_URL, 500);
        renderModal();
        await waitFor(() => expect(optionsOf('Anbieter')).toHaveLength(2));

        fill(fieldBelow('Anbieter'), 'openai');
        fireEvent.click(screen.getByText('Als Standard festlegen'));

        await expectErrorToast('Einstellungen konnten nicht aktualisiert werden');
        expect(optionsOf('Anbieter')).toEqual(['gemini (Standard)', 'openai']);
    });

    it('loads the configuration of another provider and keeps values the lists do not contain', async () => {
        renderModal();
        await waitFor(() => expect(optionsOf('Anbieter')).toHaveLength(2));

        fill(fieldBelow('Anbieter'), 'openai');

        await waitFor(() => expect(optionsOf('Modell')).toEqual(['gpt-6.1-sol', 'gpt-6.1-luna']));
        expect(fieldBelow('Modell')).toHaveValue('gpt-6.1-sol');
        expect(optionsOf('Denkaufwand')).toEqual(['xhigh', 'minimal', 'low', 'medium', 'high']);
    });

    it('saves the edited configuration and reports the change', async () => {
        backend.put(`${OCR_URL}/gemini/config`, {}).put(SETTINGS_URL, {});
        const { closeModal } = renderModal();
        await waitFor(() => expect(optionsOf('Modell')).toHaveLength(2));

        fill(fieldBelow('Modell'), 'gemini-3.8-pro');
        fill(fieldBelow('Denkaufwand'), 'high');
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ ocrConfigChanged: true }));
        expect(backend.requestsTo('PUT', `${OCR_URL}/gemini/config`)[0].body).toEqual({ model: 'gemini-3.8-pro', thinking: 'high' });
        expect(backend.requestsTo('PUT', SETTINGS_URL)[0].body).toEqual({ relativePoints: false });
    });

    it('saves relative points with the configuration', async () => {
        backend.put(`${OCR_URL}/gemini/config`, {}).put(SETTINGS_URL, {});
        const { closeModal } = renderModal();
        await waitFor(() => expect(optionsOf('Modell')).toHaveLength(2));

        fireEvent(relativePointsCheckbox(), new CustomEvent('ionChange', { detail: { checked: true } }));
        fireEvent.click(screen.getByText(SAVE));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ ocrConfigChanged: true }));
        expect(backend.requestsTo('PUT', SETTINGS_URL)[0].body).toEqual({ relativePoints: true });
    });

    it('lets the model be typed in when the provider does not list its models', async () => {
        backend.fail('GET', `${OCR_URL}/gemini/models`, 500);
        renderModal();

        await expectErrorToast('Modelle konnten nicht geladen werden');
        await waitFor(() => expect(screen.getByPlaceholderText('Modell eingeben')).toHaveValue('gemini-3.8-flash'));
    });

    it('shows the error and stays open when saving fails', async () => {
        backend.fail('PUT', `${OCR_URL}/gemini/config`, 500).put(SETTINGS_URL, {});
        const { closeModal } = renderModal();
        await waitFor(() => expect(optionsOf('Modell')).toHaveLength(2));

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Konfiguration des Anbieters konnte nicht gespeichert werden');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('explains that no provider is available and offers nothing to save', async () => {
        backend.get(`${OCR_URL}/available`, []);
        renderModal();

        expect(await screen.findByText(/Kein Anbieter verfügbar/)).toBeInTheDocument();
        expect(buttonOf(SAVE).disabled).toBe(true);
    });

    it('closes without a change on cancel', async () => {
        const { closeModal } = renderModal();
        await waitFor(() => expect(optionsOf('Modell')).toHaveLength(2));

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ ocrConfigChanged: false });
    });
});
