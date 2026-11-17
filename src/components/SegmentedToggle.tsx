import React from 'react';
import './SegmentedToggle.css';

interface SegmentedToggleProps<T> {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    label?: string;
    disabled?: boolean;
}

const SegmentedToggle = <T,>({ options, value, onChange, label, disabled = false }: SegmentedToggleProps<T>) => (
    <div className="segmentedToggle" role="group" aria-label={label}>
        {options.map(option => (
            <button
                type="button"
                key={String(option.value)}
                data-label={option.label}
                aria-pressed={option.value === value}
                disabled={disabled}
                onClick={() => option.value !== value && onChange(option.value)}
            >
                {option.label}
            </button>
        ))}
    </div>
);

export default SegmentedToggle;
