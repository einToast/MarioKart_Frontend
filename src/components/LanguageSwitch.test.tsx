import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Cookies from 'js-cookie';
import i18n, { LANGUAGE_COOKIE } from '../i18n';
import LanguageSwitch from './LanguageSwitch';
import { RoundDisplay } from './rounds/RoundDisplay';

const toggle = () => screen.getByRole('button', { name: /^Sprache: |^Language: / });
const options = () => within(screen.getByRole('list')).getAllByRole('button');

describe('LanguageSwitch', () => {
    it('shows only the current language until it is opened', () => {
        render(<LanguageSwitch />);

        expect(toggle()).toHaveTextContent('DE');
        expect(toggle()).toHaveAccessibleName('Sprache: Deutsch');
        expect(toggle()).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('lists every language with its code and name and focuses the current one', () => {
        render(<LanguageSwitch />);

        fireEvent.click(toggle());

        expect(toggle()).toHaveAttribute('aria-expanded', 'true');
        expect(options().map(option => option.textContent)).toEqual(['DEDeutsch', 'ENEnglish']);
        expect(options()[0]).toHaveAttribute('aria-pressed', 'true');
        expect(options()[1]).toHaveAttribute('aria-pressed', 'false');
        expect(options()[0]).toHaveFocus();
    });

    it('switches the whole interface, closes and remembers the choice', async () => {
        render(
            <>
                <LanguageSwitch />
                <RoundDisplay round={null} title="Spielplan" user={null} viewType="personal" teamsNotInRound={[]} />
            </>
        );
        expect(screen.getByText('Keine Spiele gefunden.')).toBeInTheDocument();
        fireEvent.click(toggle());

        fireEvent.click(screen.getByRole('button', { name: 'ENEnglish' }));

        await waitFor(() => expect(screen.getByText('No games found.')).toBeInTheDocument());
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(toggle()).toHaveTextContent('EN');
        expect(toggle()).toHaveAccessibleName('Language: English');
        expect(toggle()).toHaveFocus();
        expect(i18n.language).toBe('en');
        expect(Cookies.get(LANGUAGE_COOKIE)).toBe('en');
    });

    it('only closes when the current language is chosen again', () => {
        render(<LanguageSwitch />);
        fireEvent.click(toggle());

        fireEvent.click(options()[0]);

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(i18n.language).toBe('de');
        expect(Cookies.get(LANGUAGE_COOKIE)).toBeUndefined();
    });

    it('closes when the toggle is pressed again', () => {
        render(<LanguageSwitch />);
        fireEvent.click(toggle());

        fireEvent.click(toggle());

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('moves through the languages with the keyboard and closes with Escape', () => {
        render(<LanguageSwitch />);
        fireEvent.click(toggle());

        fireEvent.keyDown(options()[0], { key: 'ArrowDown' });
        expect(options()[1]).toHaveFocus();
        fireEvent.keyDown(options()[1], { key: 'ArrowDown' });
        expect(options()[0]).toHaveFocus();
        fireEvent.keyDown(options()[0], { key: 'ArrowUp' });
        expect(options()[1]).toHaveFocus();
        fireEvent.keyDown(options()[1], { key: 'Home' });
        expect(options()[0]).toHaveFocus();
        fireEvent.keyDown(options()[0], { key: 'End' });
        expect(options()[1]).toHaveFocus();
        fireEvent.keyDown(options()[1], { key: 'Escape' });

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(toggle()).toHaveFocus();
        expect(i18n.language).toBe('de');
    });

    it('closes when clicking somewhere else', () => {
        render(<><LanguageSwitch /><p>outside</p></>);
        fireEvent.click(toggle());

        fireEvent.mouseDown(screen.getByText('outside'));

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});
