import React, { useEffect, useRef, useState } from 'react';

const TYPEAHEAD_RESET_MS = 500;

export const useDropdown = (labels: string[], selectedIndex: number) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const labelsRef = useRef(labels);
    const search = useRef({ text: '', time: 0 });
    labelsRef.current = labels;

    const focusOption = (index: number) => {
        const count = labelsRef.current.length;
        if (count > 0) {
            optionRefs.current[(index + count) % count]?.focus();
        }
    };

    const close = () => {
        setOpen(false);
        toggleRef.current?.focus();
    };

    const typeahead = (key: string, focused: number) => {
        const now = Date.now();
        const text = (now - search.current.time > TYPEAHEAD_RESET_MS ? '' : search.current.text) + key.toLowerCase();
        search.current = { text, time: now };
        const items = labelsRef.current;
        const start = text.length === 1 ? focused + 1 : Math.max(focused, 0);
        for (let offset = 0; offset < items.length; offset++) {
            const index = (start + offset) % items.length;
            if (items[index].toLowerCase().startsWith(text)) {
                focusOption(index);
                return;
            }
        }
    };

    useEffect(() => {
        if (!open) {
            return;
        }
        focusOption(Math.max(selectedIndex, 0));
        const handleClickOutside = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            const focused = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    close();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    focusOption(focused + 1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    focusOption(focused - 1);
                    break;
                case 'Home':
                    event.preventDefault();
                    focusOption(0);
                    break;
                case 'End':
                    event.preventDefault();
                    focusOption(labelsRef.current.length - 1);
                    break;
                case 'Tab':
                    setOpen(false);
                    break;
                default:
                    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                        typeahead(event.key, focused);
                    }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const onToggleKeyDown = (event: React.KeyboardEvent) => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            setOpen(true);
        }
    };

    const optionRef = (index: number) => (element: HTMLButtonElement | null) => {
        optionRefs.current[index] = element;
    };

    return {
        open,
        toggle: () => setOpen(isOpen => !isOpen),
        close,
        rootRef,
        toggleRef,
        optionRef,
        onToggleKeyDown,
    };
};
