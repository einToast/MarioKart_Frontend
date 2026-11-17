import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import ImageSelect, { ImageSelectOption } from './ImageSelect';

const OPTIONS: ImageSelectOption[] = [
    { value: '1', label: 'Mario', character: 'Mario' },
    { value: '2', label: 'Luigi', character: 'Luigi' },
    { value: '3', label: 'Lakitu', character: 'Lakitu' },
    { value: '4', label: 'Unbekannt', character: 'Unbekannt' },
];

const Harness: React.FC<{ initial?: string; onChange?: (value: string) => void }> = ({ initial = '', onChange }) => {
    const [value, setValue] = useState(initial);
    return (
        <>
            <ImageSelect
                options={OPTIONS}
                value={value}
                placeholder="Charakter wählen"
                onChange={next => { setValue(next); onChange?.(next); }}
            />
            <button type="button">Draußen</button>
        </>
    );
};

const toggle = () => screen.getByRole('button', { name: /^Charakter wählen/ });
const options = () => screen.getAllByRole('option');

describe('ImageSelect', () => {
    it('puts the character image in front of each label and leaves it out for unknown characters', () => {
        render(<Harness />);

        fireEvent.click(toggle());

        expect(options()[0].firstElementChild).toHaveAttribute('src', '/characters/Mario.webp');
        expect(options()[0].lastElementChild).toHaveTextContent('Mario');
        expect(options()[3].querySelector('img')).not.toBeInTheDocument();
    });

    it('reports the value of the chosen option and shows its character once closed', () => {
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);
        fireEvent.click(toggle());

        fireEvent.click(screen.getByRole('option', { name: 'Luigi' }));

        expect(onChange).toHaveBeenCalledWith('2');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(toggle().querySelector('img')).toHaveAttribute('src', '/characters/Luigi.webp');
        expect(toggle()).toHaveFocus();
    });

    it('marks and focuses the current choice when it is opened again', () => {
        render(<Harness initial="3" />);

        fireEvent.click(toggle());

        expect(options().map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false']);
        expect(options()[2]).toHaveFocus();
    });

    it('opens with the arrow keys', () => {
        render(<Harness />);

        fireEvent.keyDown(toggle(), { key: 'ArrowDown' });

        expect(options()[0]).toHaveFocus();
    });

    it('jumps to the option that starts with the typed letters', () => {
        render(<Harness />);
        fireEvent.click(toggle());

        fireEvent.keyDown(options()[0], { key: 'l' });
        expect(options()[1]).toHaveFocus();
        fireEvent.keyDown(options()[1], { key: 'a' });
        expect(options()[2]).toHaveFocus();
    });

    it('names the options without showing their labels when labels are hidden', () => {
        render(<ImageSelect options={OPTIONS} value="2" placeholder="Charakter wählen" onChange={vi.fn()} hideLabels />);

        expect(toggle()).not.toHaveTextContent('Luigi');
        fireEvent.click(toggle());

        expect(options().map(option => option.textContent)).toEqual(['', '', '', '']);
        expect(screen.getByRole('option', { name: 'Lakitu' })).toHaveAttribute('title', 'Lakitu');
    });

    it('stacks the first characters of a group and counts the rest', () => {
        const group = { value: 'all', label: 'Alle', characters: ['Mario', 'Luigi', 'Peach', 'Toad', 'Yoshi', 'Wario'] };

        render(<ImageSelect options={[group]} value="all" placeholder="Charakter wählen" onChange={vi.fn()} />);

        expect(Array.from(toggle().querySelectorAll('img'), img => img.getAttribute('src'))).toEqual([
            '/characters/Mario.webp', '/characters/Luigi.webp', '/characters/Peach.webp', '/characters/Toad.webp',
        ]);
        expect(toggle()).toHaveTextContent('+2');
    });

    it('closes without a change when clicking outside', () => {
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);
        fireEvent.click(toggle());

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Draußen' }));

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });
});
