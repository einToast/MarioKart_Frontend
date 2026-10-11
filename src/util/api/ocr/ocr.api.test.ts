import { describeEndpoint } from '../../../test/endpoint';
import { OcrInputDTO, ProviderInputDTO, ProviderReturnDTO } from '../config/dto';
import { AdminOcrApi } from './index';

const ocrInput: OcrInputDTO = { provider: 'openai', image: 'aW1hZ2U=' };
const providerInput: ProviderInputDTO = { model: 'gpt-6.1-sol', thinking: 'low' };
const providerConfig: ProviderReturnDTO = { provider: 'openai', model: 'gpt-6.1-sol', thinking: 'low' };

describe('AdminOcrApi', () => {
    describeEndpoint('getAvailableProviders', {
        call: () => AdminOcrApi.getAvailableProviders(),
        method: 'GET',
        url: '/public/ocr/available',
        response: ['gemini', 'openai'],
        errors: {
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Anbieter konnten nicht geladen werden',
    });

    describeEndpoint('getProviderModels', {
        call: () => AdminOcrApi.getProviderModels('openai'),
        method: 'GET',
        url: '/public/ocr/openai/models',
        response: ['gpt-6.1-sol'],
        errors: {
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Modelle konnten nicht geladen werden',
    });

    describeEndpoint('getProviderConfig', {
        call: () => AdminOcrApi.getProviderConfig('openai'),
        method: 'GET',
        url: '/public/ocr/openai/config',
        response: providerConfig,
        errors: {
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Konfiguration des Anbieters konnte nicht geladen werden',
    });

    describeEndpoint('updateProviderConfig', {
        call: () => AdminOcrApi.updateProviderConfig('openai', providerInput),
        method: 'PUT',
        url: '/public/ocr/openai/config',
        body: providerInput,
        response: providerConfig,
        errors: {
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Konfiguration des Anbieters konnte nicht gespeichert werden',
    });

    describeEndpoint('detectCharacters', {
        call: () => AdminOcrApi.detectCharacters(6, 3, ocrInput),
        method: 'POST',
        url: '/public/ocr/6/3',
        body: ocrInput,
        response: { characters: [{ name: 'Mario', points: 15, place: 1 }] },
        errors: {
            404: 'Spiel nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Foto konnte nicht ausgewertet werden',
    });
});
