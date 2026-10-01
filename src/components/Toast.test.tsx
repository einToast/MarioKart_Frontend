import { fireEvent, render, screen } from '@testing-library/react';
import { loginAsTeam } from '../test/render';
import { errorToastColor, successToastColor } from '../util/api/config/constants';
import Toast from './Toast';

describe('Toast', () => {
    it('shows the message while showToast is set', () => {
        render(<Toast message="Team wurde geändert" showToast={true} setShowToast={vi.fn()} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Team wurde geändert');
    });

    it('shows nothing while showToast is not set', () => {
        render(<Toast message="Team wurde geändert" showToast={false} setShowToast={vi.fn()} />);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('is a red toast that stays for two seconds by default', () => {
        render(<Toast message="Fehler" showToast={true} setShowToast={vi.fn()} />);

        expect(screen.getByRole('alert')).toHaveAttribute('data-background', errorToastColor);
        expect(screen.getByRole('alert')).toHaveAttribute('data-duration', '2000');
    });

    it('is a green toast that stays for half a second for success messages', () => {
        render(<Toast message="Gespeichert" showToast={true} setShowToast={vi.fn()} isError={false} />);

        expect(screen.getByRole('alert')).toHaveAttribute('data-background', successToastColor);
        expect(screen.getByRole('alert')).toHaveAttribute('data-duration', '500');
    });

    it('resets showToast when it is dismissed', () => {
        const setShowToast = vi.fn();
        render(<Toast message="Fehler" showToast={true} setShowToast={setShowToast} />);

        fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));

        expect(setShowToast).toHaveBeenCalledWith(false);
    });

    it('is positioned above the tab bar for a logged in team', () => {
        loginAsTeam();

        render(<Toast message="Fehler" showToast={true} setShowToast={vi.fn()} />);

        expect(screen.getByRole('alert')).toHaveClass('tab-toast');
    });
});
