import React, { useEffect, useRef, useState } from "react";
import { Position, View } from "../../util/api/config/interfaces";

const MAX_SCALE = 8;
const DOUBLE_CLICK_SCALE = 3;

const FITTED: View = { scale: 1, x: 0, y: 0 };

// The photo always fills its frame, it cannot be moved out of it
const keepInFrame = (view: View, frame: HTMLElement, image: HTMLElement): View => {
    const minX = Math.min(0, frame.clientWidth - image.offsetWidth * view.scale);
    const minY = Math.min(0, frame.clientHeight - image.offsetHeight * view.scale);
    return {
        scale: view.scale,
        x: Math.min(0, Math.max(minX, view.x)),
        y: Math.min(0, Math.max(minY, view.y)),
    };
};

// Zooms around a point of the frame, so the spot of the photo below it stays where it is
const zoomAt = (view: View, point: Position, scale: number, frame: HTMLElement, image: HTMLElement): View => {
    const newScale = Math.min(MAX_SCALE, Math.max(1, scale));
    const ratio = newScale / view.scale;
    return keepInFrame({
        scale: newScale,
        x: point.x - (point.x - view.x) * ratio,
        y: point.y - (point.y - view.y) * ratio,
    }, frame, image);
};

// A photo that is zoomed with the mouse wheel or two fingers and moved by dragging.
// A double click zooms in and back out
const ZoomablePhoto: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [view, setView] = useState<View>(FITTED);
    // The handlers of one gesture follow each other faster than the component renders
    const viewRef = useRef<View>(FITTED);
    // Where the mouse or the fingers that are down were last
    const pointersRef = useRef(new Map<number, Position>());

    const change = (toView: (view: View, frame: HTMLElement, image: HTMLElement) => View) => {
        if (frameRef.current && imageRef.current) {
            viewRef.current = toView(viewRef.current, frameRef.current, imageRef.current);
            setView(viewRef.current);
        }
    };

    const positionInFrame = (event: { clientX: number, clientY: number }, frame: HTMLElement): Position => {
        const area = frame.getBoundingClientRect();
        return { x: event.clientX - area.left, y: event.clientY - area.top };
    };

    // React listens to the wheel passively, which would also scroll the page while zooming
    useEffect(() => {
        const frame = frameRef.current;
        const image = imageRef.current;
        if (!frame || !image) {
            return;
        }

        const handleWheel = (event: WheelEvent) => {
            const current = viewRef.current;
            // Firefox counts lines, and pinching on a touchpad arrives as small steps with ctrl
            const distance = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 30 : 1) * (event.ctrlKey ? 5 : 1);
            const scale = current.scale * Math.exp(-distance * 0.002);
            // A photo that is not zoomed in leaves scrolling down to the page
            if (current.scale === 1 && scale <= 1) {
                return;
            }

            event.preventDefault();
            viewRef.current = zoomAt(current, positionInFrame(event, frame), scale, frame, image);
            setView(viewRef.current);
        };

        frame.addEventListener('wheel', handleWheel, { passive: false });
        return () => frame.removeEventListener('wheel', handleWheel);
    }, []);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const pointers = pointersRef.current;
        const previous = pointers.get(event.pointerId);
        if (!previous) {
            return;
        }

        const position = { x: event.clientX, y: event.clientY };
        const other = Array.from(pointers.entries()).find(([id]) => id !== event.pointerId)?.[1];
        if (other) {
            // Two fingers zoom around the middle between them
            const before = Math.hypot(previous.x - other.x, previous.y - other.y);
            const after = Math.hypot(position.x - other.x, position.y - other.y);
            if (before > 0) {
                change((current, frame, image) => {
                    const middle = positionInFrame({ clientX: (position.x + other.x) / 2, clientY: (position.y + other.y) / 2 }, frame);
                    return zoomAt(current, middle, current.scale * after / before, frame, image);
                });
            }
        } else {
            change((current, frame, image) => keepInFrame({
                scale: current.scale,
                x: current.x + position.x - previous.x,
                y: current.y + position.y - previous.y,
            }, frame, image));
        }
        pointers.set(event.pointerId, position);
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        pointersRef.current.delete(event.pointerId);
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        change((current, frame, image) => current.scale > 1
            ? FITTED
            : zoomAt(current, positionInFrame(event, frame), DOUBLE_CLICK_SCALE, frame, image));
    };

    return (
        <div
            className={view.scale > 1 ? "resultPhoto zoomed" : "resultPhoto"}
            ref={frameRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onDoubleClick={handleDoubleClick}
        >
            <img
                src={src}
                alt={alt}
                ref={imageRef}
                draggable={false}
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            />
        </div>
    );
};

export default ZoomablePhoto;
