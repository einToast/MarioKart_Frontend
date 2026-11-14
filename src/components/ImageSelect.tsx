import { IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import React from 'react';
import { useDropdown } from '../hooks/useDropdown';
import characters from '../util/api/config/characters';
import './ImageSelect.css';

const MAX_STACKED_CHARACTERS = 4;

export interface ImageSelectOption {
    value: string;
    label: string;
    character?: string;
    characters?: string[];
    icon?: string;
}

interface ImageSelectProps {
    options: ImageSelectOption[];
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    className?: string;
    hideLabels?: boolean;
}

const OptionImage: React.FC<{ option: ImageSelectOption }> = ({ option }) => {
    if (option.icon) {
        return <IonIcon className="imageSelectImage" aria-hidden="true" icon={option.icon} />;
    }
    if (option.characters?.length) {
        const shown = option.characters.slice(0, MAX_STACKED_CHARACTERS);
        const hidden = option.characters.length - shown.length;
        return (
            <span className="imageSelectStack" aria-hidden="true">
                {shown.map(character => (
                    <img key={character} src={`/characters/${character}.webp`} alt="" />
                ))}
                {hidden > 0 && <span className="imageSelectStackMore">+{hidden}</span>}
            </span>
        );
    }
    if (option.character && characters.includes(option.character)) {
        return <img className="imageSelectImage" src={`/characters/${option.character}.webp`} alt="" />;
    }
    return <span className="imageSelectImage" aria-hidden="true" />;
};

const ImageSelect: React.FC<ImageSelectProps> = ({ options, value, placeholder, onChange, className, hideLabels = false }) => {
    const selectedIndex = options.findIndex(option => option.value === value);
    const selected = options[selectedIndex];
    const { open, toggle, close, rootRef, toggleRef, optionRef, onToggleKeyDown } = useDropdown(
        options.map(option => option.label),
        selectedIndex,
    );

    const choose = (option: ImageSelectOption) => {
        onChange(option.value);
        close();
    };

    return (
        <div className={className ? `imageSelect ${className}` : 'imageSelect'} ref={rootRef}>
            <button
                type="button"
                ref={toggleRef}
                className="imageSelectToggle"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={selected ? `${placeholder}: ${selected.label}` : placeholder}
                onClick={toggle}
                onKeyDown={onToggleKeyDown}
            >
                {selected && <OptionImage option={selected} />}
                {(!selected || !hideLabels) && (
                    <span className={selected ? 'imageSelectLabel' : 'imageSelectLabel imageSelectPlaceholder'}>
                        {selected?.label ?? placeholder}
                    </span>
                )}
                <IonIcon className="imageSelectChevron" aria-hidden="true" icon={chevronDownOutline} />
            </button>
            {open && (
                <div className="imageSelectMenu" role="listbox" aria-label={placeholder}>
                    {options.map((option, index) => (
                        <button
                            type="button"
                            role="option"
                            key={option.value}
                            ref={optionRef(index)}
                            aria-selected={option.value === value}
                            aria-label={hideLabels ? option.label : undefined}
                            title={hideLabels ? option.label : undefined}
                            onClick={() => choose(option)}
                        >
                            <OptionImage option={option} />
                            {!hideLabels && <span>{option.label}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSelect;
