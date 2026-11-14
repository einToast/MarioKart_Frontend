import { fireEvent, render, screen } from '@testing-library/react';
import SegmentedToggle from './SegmentedToggle';

const OPTIONS = [
    { value: false, label: 'Nein' },
    { value: true, label: 'Ja' },
];

describe('SegmentedToggle', () => {
    it('reports the other option but not the current one again', () => {
        const onChange = vi.fn();
        render(<SegmentedToggle label="Pause beendet" options={OPTIONS} value={false} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Nein' }));
        fireEvent.click(screen.getByRole('button', { name: 'Ja' }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('ignores clicks while disabled', () => {
        const onChange = vi.fn();
        render(<SegmentedToggle label="Pause beendet" options={OPTIONS} value={false} onChange={onChange} disabled />);

        fireEvent.click(screen.getByRole('button', { name: 'Ja' }));

        expect(onChange).not.toHaveBeenCalled();
    });
});
