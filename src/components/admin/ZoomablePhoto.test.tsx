import { fireEvent, render, screen } from '@testing-library/react';
import ZoomablePhoto from './ZoomablePhoto';

// jsdom does no layout, so the photo gets the size of its frame by hand
const renderPhoto = (width = 200, height = 100) => {
    const { container } = render(<ZoomablePhoto src="blob:photo" alt="Ergebnis" />);
    const frame = container.querySelector('.resultPhoto') as HTMLElement;
    const image = screen.getByAltText('Ergebnis');

    Object.defineProperties(frame, { clientWidth: { value: width }, clientHeight: { value: height } });
    Object.defineProperties(image, { offsetWidth: { value: width }, offsetHeight: { value: height } });

    return { frame, image };
};

const transformOf = (image: HTMLElement) => {
    const [, x, y, scale] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\) scale\(([\d.]+)\)/.exec(image.style.transform) ?? [];
    return { x: Number(x), y: Number(y), scale: Number(scale) };
};

describe('ZoomablePhoto', () => {
    beforeAll(() => {
        // jsdom has no pointer capture
        Element.prototype.setPointerCapture = vi.fn();
    });

    it('shows the whole photo at first', () => {
        const { frame, image } = renderPhoto();

        expect(image).toHaveAttribute('src', 'blob:photo');
        expect(transformOf(image)).toEqual({ x: 0, y: 0, scale: 1 });
        expect(frame).not.toHaveClass('zoomed');
    });

    it('zooms in with the wheel and keeps the spot below the mouse in place', () => {
        const { frame, image } = renderPhoto();

        const scrolledPage = fireEvent.wheel(frame, { deltaY: -500, clientX: 100, clientY: 50 });

        const { x, y, scale } = transformOf(image);
        expect(scrolledPage).toBe(false);
        expect(scale).toBeCloseTo(Math.E);
        // The middle of the photo was below the mouse and still is
        expect(x + 100 * scale).toBeCloseTo(100);
        expect(y + 50 * scale).toBeCloseTo(50);
        expect(frame).toHaveClass('zoomed');
    });

    it('zooms back out with the wheel, but never smaller than the frame', () => {
        const { frame, image } = renderPhoto();
        fireEvent.wheel(frame, { deltaY: -500, clientX: 100, clientY: 50 });

        fireEvent.wheel(frame, { deltaY: 5000, clientX: 100, clientY: 50 });

        expect(transformOf(image)).toEqual({ x: 0, y: 0, scale: 1 });
    });

    it('does not zoom in further than eight times', () => {
        const { frame, image } = renderPhoto();

        fireEvent.wheel(frame, { deltaY: -50000 });

        expect(transformOf(image).scale).toBe(8);
    });

    it('leaves scrolling down to the page while the photo is not zoomed in', () => {
        const { frame, image } = renderPhoto();

        const scrolledPage = fireEvent.wheel(frame, { deltaY: 100 });

        expect(scrolledPage).toBe(true);
        expect(transformOf(image).scale).toBe(1);
    });

    it('moves the zoomed photo by dragging, but not out of its frame', () => {
        const { frame, image } = renderPhoto();
        fireEvent.doubleClick(frame, { clientX: 0, clientY: 0 });
        expect(transformOf(image)).toEqual({ x: 0, y: 0, scale: 3 });

        fireEvent.pointerDown(frame, { pointerId: 1, clientX: 150, clientY: 80 });
        fireEvent.pointerMove(frame, { pointerId: 1, clientX: 100, clientY: 60 });
        expect(transformOf(image)).toEqual({ x: -50, y: -20, scale: 3 });

        fireEvent.pointerMove(frame, { pointerId: 1, clientX: -900, clientY: -900 });
        expect(transformOf(image)).toEqual({ x: -400, y: -200, scale: 3 });

        // Without a button or finger down the photo stays where it is
        fireEvent.pointerUp(frame, { pointerId: 1 });
        fireEvent.pointerMove(frame, { pointerId: 1, clientX: 0, clientY: 0 });
        expect(transformOf(image)).toEqual({ x: -400, y: -200, scale: 3 });
    });

    it('zooms with two fingers around the middle between them', () => {
        const { frame, image } = renderPhoto();
        fireEvent.pointerDown(frame, { pointerId: 1, clientX: 50, clientY: 50 });
        fireEvent.pointerDown(frame, { pointerId: 2, clientX: 150, clientY: 50 });

        fireEvent.pointerMove(frame, { pointerId: 2, clientX: 250, clientY: 50 });

        // The fingers are twice as far apart, their middle is at 150
        expect(transformOf(image)).toEqual({ x: -150, y: -50, scale: 2 });
    });

    it('zooms in and back out with a double click', () => {
        const { frame, image } = renderPhoto();

        fireEvent.doubleClick(frame, { clientX: 100, clientY: 50 });
        expect(transformOf(image)).toEqual({ x: -200, y: -100, scale: 3 });

        fireEvent.doubleClick(frame, { clientX: 100, clientY: 50 });
        expect(transformOf(image)).toEqual({ x: 0, y: 0, scale: 1 });
    });
});
