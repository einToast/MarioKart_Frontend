import React, { useRef, useState } from 'react';
import { SwitchDTO } from '../../util/api/config/dto';
import {
    createDefaultFloorPlan,
    createElement,
    FLOOR_PLAN_HEIGHT,
    FLOOR_PLAN_WIDTH,
    FloorPlan,
    FloorPlanElement,
    FloorPlanElementType,
    MAX_FLOOR_PLAN_ELEMENTS,
    MAX_FLOOR_PLAN_TEXT_LENGTH,
    removeElement,
    updateElement,
} from '../../util/layout/floorPlan';
import FloorPlanView, { elementLabel } from './FloorPlanView';

const KEY_STEP = 10;
const FINE_KEY_STEP = 1;

const KEY_DIRECTIONS: Record<string, { x: number; y: number }> = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
};

interface Drag {
    id: string;
    // Distance between the pointer and the centre of the element when the drag started
    offsetX: number;
    offsetY: number;
}

const FloorPlanEditor: React.FC<{ plan: FloorPlan, switches: SwitchDTO[], onChange: (plan: FloorPlan) => void }> = ({ plan, switches, onChange }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const drag = useRef<Drag | null>(null);

    const selected = plan.elements.find(element => element.id === selectedId) ?? null;

    const toPlanCoordinates = (event: React.PointerEvent): { x: number; y: number } | null => {
        const bounds = svgRef.current?.getBoundingClientRect();
        if (!bounds?.width || !bounds.height) {
            return null;
        }
        return {
            x: ((event.clientX - bounds.left) / bounds.width) * FLOOR_PLAN_WIDTH,
            y: ((event.clientY - bounds.top) / bounds.height) * FLOOR_PLAN_HEIGHT,
        };
    };

    const handleElementPointerDown = (event: React.PointerEvent<SVGGElement>, element: FloorPlanElement) => {
        setSelectedId(element.id);
        const position = toPlanCoordinates(event);
        if (!position) {
            return;
        }
        drag.current = { id: element.id, offsetX: position.x - element.x, offsetY: position.y - element.y };
        svgRef.current?.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
        const position = toPlanCoordinates(event);
        if (!drag.current || !position) {
            return;
        }
        onChange(updateElement(plan, drag.current.id, {
            x: Math.round(position.x - drag.current.offsetX),
            y: Math.round(position.y - drag.current.offsetY),
        }));
    };

    const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
        if (drag.current) {
            drag.current = null;
            svgRef.current?.releasePointerCapture?.(event.pointerId);
        }
    };

    const handleRemove = (element: FloorPlanElement) => {
        onChange(removeElement(plan, element.id));
        setSelectedId(null);
    };

    const handleElementKeyDown = (event: React.KeyboardEvent<SVGGElement>, element: FloorPlanElement) => {
        const direction = KEY_DIRECTIONS[event.key];
        if (direction) {
            event.preventDefault();
            const step = event.shiftKey ? FINE_KEY_STEP : KEY_STEP;
            onChange(updateElement(plan, element.id, { x: element.x + direction.x * step, y: element.y + direction.y * step }));
        } else if ((event.key === 'Delete' || event.key === 'Backspace') && element.type !== 'switch') {
            event.preventDefault();
            handleRemove(element);
        }
    };

    const handleAdd = (type: FloorPlanElementType) => {
        const element = createElement(plan, type);
        onChange({ ...plan, elements: [...plan.elements, element] });
        setSelectedId(element.id);
    };

    const handleReset = () => {
        onChange(createDefaultFloorPlan(switches.length));
        setSelectedId(null);
    };

    const numberField = (label: string, property: 'width' | 'height' | 'rotation', element: FloorPlanElement, min: number, max: number) => (
        <label>
            {label}
            <input
                type="number"
                min={min}
                max={max}
                value={element[property]}
                onChange={(event) => {
                    if (event.target.value !== '') {
                        onChange(updateElement(plan, element.id, { [property]: Number(event.target.value) }));
                    }
                }}
            />
        </label>
    );

    const full = plan.elements.length >= MAX_FLOOR_PLAN_ELEMENTS;

    return (
        <div className="floorPlanEditor">
            <div className="floorPlanToolbar">
                <button type="button" onClick={() => handleAdd('table')} disabled={full}>+ Tisch</button>
                <button type="button" onClick={() => handleAdd('row')} disabled={full}>+ Sitzreihe</button>
                <button type="button" onClick={() => handleAdd('text')} disabled={full}>+ Text</button>
                <button type="button" onClick={handleReset}>Standard-Anordnung</button>
            </div>
            <FloorPlanView
                plan={plan}
                switches={switches}
                selectedId={selectedId}
                svgRef={svgRef}
                onElementPointerDown={handleElementPointerDown}
                onElementKeyDown={handleElementKeyDown}
                onElementFocus={(element) => setSelectedId(element.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />
            <div className="floorPlanProperties">
                {selected ? (
                    <>
                        <p><strong>{elementLabel(selected, switches)}</strong></p>
                        {selected.type === 'text' && (
                            <label>
                                Text
                                <input
                                    type="text"
                                    maxLength={MAX_FLOOR_PLAN_TEXT_LENGTH}
                                    value={selected.text ?? ''}
                                    onChange={(event) => onChange(updateElement(plan, selected.id, { text: event.target.value }))}
                                />
                            </label>
                        )}
                        {(selected.type === 'table' || selected.type === 'row') && numberField('Breite', 'width', selected, 4, FLOOR_PLAN_WIDTH)}
                        {selected.type === 'table' && numberField('Höhe', 'height', selected, 4, FLOOR_PLAN_HEIGHT)}
                        {selected.type === 'text' && numberField('Größe', 'height', selected, 10, 200)}
                        {numberField('Drehung', 'rotation', selected, -180, 180)}
                        {selected.type !== 'switch' && (
                            <button type="button" onClick={() => handleRemove(selected)}>Entfernen</button>
                        )}
                    </>
                ) : (
                    <p>Element antippen und ziehen, mit den Pfeiltasten verschieben oder hier anpassen.</p>
                )}
            </div>
        </div>
    );
};

export default FloorPlanEditor;
