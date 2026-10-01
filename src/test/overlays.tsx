import { screen } from '@testing-library/react';
import React, { useEffect, useRef } from 'react';
import { expect } from 'vitest';
import { errorToastColor, successToastColor } from '../util/api/config/constants';

interface FakeIonToastProps {
    isOpen?: boolean;
    message?: string;
    duration?: number;
    className?: string;
    style?: Record<string, string>;
    onDidDismiss?: () => void;
}

/**
 * Replacement for IonToast (wired up in setupTests.ts). The real toast renders its message into
 * shadow DOM and dismisses itself after `duration`, which makes assertions timing dependent.
 * This one stays visible while `isOpen` is set; clicking it dismisses it.
 */
export const FakeIonToast: React.FC<FakeIonToastProps> = ({ isOpen, message, duration, className, style, onDidDismiss }) => {
    if (!isOpen) {
        return null;
    }
    return (
        <div
            role="alert"
            data-testid="toast"
            className={className}
            data-duration={duration}
            data-background={style?.['--toast-background']}
            onClick={() => onDidDismiss?.()}
        >
            {message}
        </div>
    );
};

interface FakeIonModalProps {
    isOpen?: boolean;
    onDidDismiss?: () => void;
    children?: React.ReactNode;
}

/**
 * Replacement for IonModal (wired up in setupTests.ts). The real modal moves its content out of
 * the React tree and leaves it in the document after a test unmounts. Like the real one, this
 * renders its children only while open and fires `onDidDismiss` once `isOpen` is withdrawn.
 */
export const FakeIonModal: React.FC<FakeIonModalProps> = ({ isOpen, onDidDismiss, children }) => {
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen) {
            onDidDismiss?.();
        }
        wasOpen.current = Boolean(isOpen);
    }, [isOpen]);

    return isOpen ? <div role="dialog">{children}</div> : null;
};

export const findToast = (message: string | RegExp): Promise<HTMLElement> =>
    screen.findByText(message, { selector: '[data-testid="toast"]' });

export const queryToast = (): HTMLElement | null => screen.queryByTestId('toast');

export const expectErrorToast = async (message: string | RegExp): Promise<HTMLElement> => {
    const toast = await findToast(message);
    expect(toast).toHaveAttribute('data-background', errorToastColor);
    return toast;
};

export const expectSuccessToast = async (message: string | RegExp): Promise<HTMLElement> => {
    const toast = await findToast(message);
    expect(toast).toHaveAttribute('data-background', successToastColor);
    return toast;
};
