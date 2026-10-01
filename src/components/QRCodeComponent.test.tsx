import { render, screen } from '@testing-library/react';
import QRCodeComponent from './QRCodeComponent';

// The real QRCodeCanvas paints onto a canvas, which jsdom does not implement
vi.mock('qrcode.react', () => ({
    QRCodeCanvas: ({ value, size }: { value: string; size: number }) => (
        <canvas data-testid="qr-code" data-value={value} data-size={size} />
    ),
}));

describe('QRCodeComponent', () => {
    it('encodes the address the app is served from', () => {
        render(<QRCodeComponent />);

        expect(screen.getByTestId('qr-code')).toHaveAttribute('data-value', window.location.origin);
        expect(window.location.origin).toBe('https://localhost:5173');
    });

    it('renders the code 200 pixels wide', () => {
        render(<QRCodeComponent />);

        expect(screen.getByTestId('qr-code')).toHaveAttribute('data-size', '200');
    });
});
