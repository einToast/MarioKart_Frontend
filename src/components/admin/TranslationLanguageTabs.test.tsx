import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from '../../i18n';
import TranslationLanguageTabs from './TranslationLanguageTabs';

const HINT = 'Leere Felder zeigen den Text der Standardsprache.';

describe('TranslationLanguageTabs', () => {
    it('offers every language and marks the edited one', () => {
        render(<TranslationLanguageTabs value="de" onChange={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Deutsch (Standard)' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('loads the chosen language before reporting it', async () => {
        const onChange = vi.fn(() => expect(i18n.hasResourceBundle('en', 'translation')).toBe(true));
        render(<TranslationLanguageTabs value="de" onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'English' }));

        await waitFor(() => expect(onChange).toHaveBeenCalledWith('en'));
    });

    it('keeps the space of the fallback hint while the default language is edited, so nothing moves', () => {
        const { rerender } = render(<TranslationLanguageTabs value="de" onChange={vi.fn()} />);

        expect(screen.getByText(HINT)).toHaveClass('translationHintHidden');
        expect(screen.getByText(HINT)).toHaveAttribute('aria-hidden', 'true');

        rerender(<TranslationLanguageTabs value="en" onChange={vi.fn()} />);

        expect(screen.getByText(HINT)).not.toHaveClass('translationHintHidden');
        expect(screen.getByText(HINT)).toHaveAttribute('aria-hidden', 'false');
    });
});
