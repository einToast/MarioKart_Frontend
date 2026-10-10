import React, { useId } from 'react';
import { SwitchDTO } from '../../util/api/config/dto';
import { FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH, FloorPlan, FloorPlanElement } from '../../util/layout/floorPlan';
import { resolveSwitch } from '../../util/layout/switches';
import './FloorPlan.css';

const SWITCH_RADIUS = 30;
const SELECTION_PADDING = 10;
// Rows are thin lines, the invisible area around them makes them easier to grab
const MIN_HIT_SIZE = 28;

export interface FloorPlanViewProps {
    plan: FloorPlan;
    switches: SwitchDTO[];
    // The following props turn the plan into the canvas of the editor
    selectedId?: string | null;
    svgRef?: React.Ref<SVGSVGElement>;
    onElementPointerDown?: (event: React.PointerEvent<SVGGElement>, element: FloorPlanElement) => void;
    onElementKeyDown?: (event: React.KeyboardEvent<SVGGElement>, element: FloorPlanElement) => void;
    onElementFocus?: (element: FloorPlanElement) => void;
    onPointerMove?: (event: React.PointerEvent<SVGSVGElement>) => void;
    onPointerUp?: (event: React.PointerEvent<SVGSVGElement>) => void;
}

export const elementLabel = (element: FloorPlanElement, switches: SwitchDTO[]): string => {
    switch (element.type) {
        case 'switch':
            return `Switch ${resolveSwitch(switches, element.switchIndex ?? 0).name}`;
        case 'table':
            return 'Tisch';
        case 'row':
            return 'Sitzreihe';
        default:
            return `Text ${element.text ?? ''}`.trim();
    }
};

const FloorPlanView: React.FC<FloorPlanViewProps> = ({
    plan,
    switches,
    selectedId,
    svgRef,
    onElementPointerDown,
    onElementKeyDown,
    onElementFocus,
    onPointerMove,
    onPointerUp,
}) => {
    const gradientId = useId();
    const editable = onElementPointerDown !== undefined;
    const outline = `url(#${gradientId}-element)`;

    // Switches are drawn last so that they stay visible on top of their screen
    const elements = [...plan.elements].sort((a, b) => Number(a.type === 'switch') - Number(b.type === 'switch'));

    const renderShape = (element: FloorPlanElement) => {
        switch (element.type) {
            case 'switch': {
                const { name, color } = resolveSwitch(switches, element.switchIndex ?? 0);
                return (
                    <>
                        <circle r={SWITCH_RADIUS} fill={color} />
                        <text className="floorPlanSwitchName" y={SWITCH_RADIUS + 36} fill={color} textAnchor="middle">
                            switch {name.toLowerCase()}
                        </text>
                    </>
                );
            }
            case 'table':
                return (
                    <rect
                        x={-element.width / 2}
                        y={-element.height / 2}
                        width={element.width}
                        height={element.height}
                        rx={3}
                        fill="none"
                        stroke={outline}
                        strokeWidth={4}
                    />
                );
            case 'row':
                return (
                    <line
                        x1={-element.width / 2}
                        x2={element.width / 2}
                        stroke={outline}
                        strokeWidth={4}
                        strokeLinecap="round"
                    />
                );
            default:
                return (
                    <text
                        className="floorPlanText"
                        fontSize={element.height * 0.7}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {element.text}
                    </text>
                );
        }
    };

    const selectionBox = (element: FloorPlanElement) => {
        const width = (element.type === 'switch' ? SWITCH_RADIUS * 2 : element.width) + SELECTION_PADDING * 2;
        const height = (element.type === 'switch' ? SWITCH_RADIUS * 2 : Math.max(element.height, MIN_HIT_SIZE)) + SELECTION_PADDING * 2;
        return { x: -width / 2, y: -height / 2, width, height };
    };

    return (
        <svg
            ref={svgRef}
            className={editable ? 'floorPlan floorPlanEditable' : 'floorPlan'}
            viewBox={`0 0 ${FLOOR_PLAN_WIDTH} ${FLOOR_PLAN_HEIGHT}`}
            role="img"
            aria-label="Raumplan"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <defs>
                <linearGradient id={`${gradientId}-room`} gradientUnits="userSpaceOnUse" x1={0} x2={FLOOR_PLAN_WIDTH}>
                    <stop offset="0" stopColor="#C9B6F7" />
                    <stop offset="1" stopColor="#93CFFB" />
                </linearGradient>
                {/* In the coordinates of an element, whose centre is its origin */}
                <linearGradient id={`${gradientId}-element`} gradientUnits="userSpaceOnUse" x1={-160} x2={160}>
                    <stop offset="0" stopColor="#C9B6F7" />
                    <stop offset="1" stopColor="#93CFFB" />
                </linearGradient>
            </defs>
            {plan.outline ? (
                <polygon
                    className="floorPlanRoom"
                    points={plan.outline.map(point => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={`url(#${gradientId}-room)`}
                    strokeWidth={4}
                    strokeLinejoin="round"
                />
            ) : (
                <rect
                    className="floorPlanRoom"
                    x={2}
                    y={2}
                    width={FLOOR_PLAN_WIDTH - 4}
                    height={FLOOR_PLAN_HEIGHT - 4}
                    rx={24}
                    fill="none"
                    stroke={`url(#${gradientId}-room)`}
                    strokeWidth={4}
                />
            )}
            {elements.map(element => {
                const selected = element.id === selectedId;
                const box = selectionBox(element);
                return (
                    <g
                        key={element.id}
                        data-element-id={element.id}
                        data-element-type={element.type}
                        className={selected ? 'floorPlanElement selected' : 'floorPlanElement'}
                        transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`}
                        {...(editable ? {
                            role: 'button',
                            tabIndex: 0,
                            'aria-label': elementLabel(element, switches),
                            'aria-pressed': selected,
                            onPointerDown: (event: React.PointerEvent<SVGGElement>) => onElementPointerDown(event, element),
                            onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => onElementKeyDown?.(event, element),
                            onFocus: () => onElementFocus?.(element),
                        } : {})}
                    >
                        {editable && <rect className="floorPlanHitArea" {...box} rx={8} />}
                        {renderShape(element)}
                    </g>
                );
            })}
        </svg>
    );
};

export default FloorPlanView;
