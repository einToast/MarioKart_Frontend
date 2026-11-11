import { fireEvent, render, screen } from '@testing-library/react';
import TranslationLanguageTabs from './TranslationLanguageTabs';

const HINT = 'Leere Felder zeigen den Text der Standardsprache.';

describe('TranslationLanguageTabs', () => {
    it('offers every language and marks the edited one', () => {
        render(<TranslationLanguageTabs value="de" onChange={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Deutsch (Standard)' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('reports the chosen language', () => {
        const onChange = vi.fn();
        render(<TranslationLanguageTabs value="de" onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'English' }));

        expect(onChange).toHaveBeenCalledWith('en');
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
