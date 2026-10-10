import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { makeSwitches } from '../../test/fixtures';
import { createDefaultFloorPlan, createElement, FloorPlan, FloorPlanElement } from '../../util/layout/floorPlan';
import FloorPlanEditor from './FloorPlanEditor';
import FloorPlanView from './FloorPlanView';

const twoSwitches = () => makeSwitches().slice(0, 2);
const groups = (container: HTMLElement) => Array.from(container.querySelectorAll<SVGGElement>('g.floorPlanElement'));

describe('FloorPlanView', () => {
    it('draws every switch with its name and colour on top of the furniture', () => {
        const { container } = render(<FloorPlanView plan={createDefaultFloorPlan(2)} switches={twoSwitches()} />);

        expect(screen.getByRole('img', { name: 'Raumplan' })).toBeInTheDocument();
        expect(screen.getByText('switch blau')).toHaveAttribute('fill', '#9DAEDA');
        expect(screen.getByText('switch rot')).toHaveAttribute('fill', '#DA9DC9');
        expect(groups(container).map(group => group.dataset.elementType)).toEqual([
            'table', 'row', 'row', 'row', 'row', 'table', 'row', 'row', 'table',
            'text', 'text', 'text', 'text', 'text', 'text', 'text', 'switch', 'switch',
        ]);
    });

    it('labels the drinks counter and the exits', () => {
        render(<FloorPlanView plan={createDefaultFloorPlan(1)} switches={twoSwitches()} />);

        expect(screen.getByText('getränke')).toBeInTheDocument();
        expect(screen.getAllByText('food')).toHaveLength(2);
        expect(screen.getAllByText('toilett')).toHaveLength(2);
    });

    it('draws the outline of the room', () => {
        const { container } = render(<FloorPlanView plan={createDefaultFloorPlan(2)} switches={twoSwitches()} />);

        expect(container.querySelector('polygon.floorPlanRoom')).toHaveAttribute('points', '2,2 998,2 998,533 712,636 348,636 2,533');
    });

    it('frames a plan without an outline by the canvas', () => {
        const { container } = render(<FloorPlanView plan={{ version: 1, elements: [] }} switches={[]} />);

        expect(container.querySelector('rect.floorPlanRoom')).toBeInTheDocument();
        expect(container.querySelector('polygon')).toBeNull();
    });

    it('numbers switches that are not configured', () => {
        render(<FloorPlanView plan={createDefaultFloorPlan(1)} switches={[]} />);

        expect(screen.getByText('switch 1')).toBeInTheDocument();
    });

    it('places and rotates the elements', () => {
        const plan: FloorPlan = { version: 1, elements: [] };
        plan.elements.push(createElement(plan, 'text', { x: 100, y: 50, rotation: 90, text: 'Eingang' }));

        const { container } = render(<FloorPlanView plan={plan} switches={[]} />);

        expect(groups(container)[0]).toHaveAttribute('transform', 'translate(100 50) rotate(90)');
        expect(screen.getByText('Eingang')).toBeInTheDocument();
    });

    it('is not interactive outside of the editor', () => {
        const { container } = render(<FloorPlanView plan={createDefaultFloorPlan(1)} switches={[]} />);

        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(container.querySelector('.floorPlanHitArea')).toBeNull();
    });
});

describe('FloorPlanEditor', () => {
    let latest: FloorPlan;

    const Harness = ({ initial }: { initial: FloorPlan }) => {
        const [plan, setPlan] = useState(initial);
        latest = plan;
        return <FloorPlanEditor plan={plan} switches={twoSwitches()} onChange={setPlan} />;
    };

    const renderEditor = (initial = createDefaultFloorPlan(2)) => render(<Harness initial={initial} />);
    const byType = (type: FloorPlanElement['type']) => latest.elements.filter(element => element.type === type);
    const marker = (name: string) => screen.getByRole('button', { name: `Switch ${name}` });

    // jsdom has no layout: the canvas is given a size of half the plan, so 1px equals 2 plan units
    const giveCanvasSize = (container: HTMLElement) => {
        const svg = container.querySelector('svg') as SVGSVGElement;
        svg.getBoundingClientRect = () => ({ left: 10, top: 20, width: 500, height: 320 }) as DOMRect;
        return svg;
    };

    it('adds a table, a seat row and a label and selects the new element', () => {
        renderEditor();

        fireEvent.click(screen.getByText('+ Tisch'));
        fireEvent.click(screen.getByText('+ Sitzreihe'));
        fireEvent.click(screen.getByText('+ Text'));

        expect(byType('table')).toHaveLength(4);
        expect(byType('row')).toHaveLength(7);
        expect(byType('text')).toHaveLength(8);
        expect(screen.getByLabelText('Text')).toHaveValue('Text');
    });

    it('edits the selected label', () => {
        renderEditor();
        fireEvent.click(screen.getByText('+ Text'));

        fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'Eingang' } });
        fireEvent.change(screen.getByLabelText('Größe'), { target: { value: '60' } });
        fireEvent.change(screen.getByLabelText('Drehung'), { target: { value: '45' } });

        expect(byType('text').at(-1)).toMatchObject({ text: 'Eingang', height: 60, rotation: 45 });
        expect(screen.getByRole('button', { name: 'Text Eingang' })).toBeInTheDocument();
    });

    it('resizes a table and ignores an emptied number field', () => {
        renderEditor();
        fireEvent.click(screen.getByText('+ Tisch'));

        fireEvent.change(screen.getByLabelText('Breite'), { target: { value: '300' } });
        fireEvent.change(screen.getByLabelText('Höhe'), { target: { value: '' } });

        expect(byType('table').at(-1)).toMatchObject({ width: 300, height: 22 });
    });

    it('moves the focused element with the arrow keys', () => {
        renderEditor();
        const before = byType('switch')[0];

        fireEvent.focus(marker('Blau'));
        fireEvent.keyDown(marker('Blau'), { key: 'ArrowRight' });
        fireEvent.keyDown(marker('Blau'), { key: 'ArrowDown', shiftKey: true });

        expect(byType('switch')[0]).toMatchObject({ x: before.x + 10, y: before.y + 1 });
        expect(marker('Blau')).toHaveAttribute('aria-pressed', 'true');
    });

    it('drags an element with the pointer', () => {
        const { container } = renderEditor();
        const svg = giveCanvasSize(container);
        const before = byType('switch')[1];

        // Grabbed 4 plan units right of its centre, released at plan position (400, 200)
        fireEvent.pointerDown(marker('Rot'), { clientX: 10 + (before.x + 4) / 2, clientY: 20 + before.y / 2 });
        fireEvent.pointerMove(svg, { clientX: 10 + 202, clientY: 20 + 100 });
        fireEvent.pointerUp(svg);
        fireEvent.pointerMove(svg, { clientX: 10, clientY: 20 });

        expect(byType('switch')[1]).toMatchObject({ x: 400, y: 200 });
    });

    it('only selects an element while the canvas has no size', () => {
        const { container } = renderEditor();
        const before = byType('switch')[0];

        fireEvent.pointerDown(marker('Blau'), { clientX: 50, clientY: 50 });
        fireEvent.pointerMove(container.querySelector('svg') as SVGSVGElement, { clientX: 90, clientY: 90 });

        expect(byType('switch')[0]).toEqual(before);
        expect(marker('Blau')).toHaveAttribute('aria-pressed', 'true');
    });

    it('removes furniture with the button or the delete key', () => {
        renderEditor();

        fireEvent.click(screen.getByText('+ Tisch'));
        fireEvent.click(screen.getByText('Entfernen'));
        expect(byType('table')).toHaveLength(3);

        fireEvent.keyDown(screen.getAllByRole('button', { name: 'Sitzreihe' })[0], { key: 'Delete' });
        expect(byType('row')).toHaveLength(5);
    });

    it('never removes a switch marker', () => {
        renderEditor();

        fireEvent.focus(marker('Blau'));
        fireEvent.keyDown(marker('Blau'), { key: 'Delete' });

        expect(byType('switch')).toHaveLength(2);
        expect(screen.queryByText('Entfernen')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Breite')).not.toBeInTheDocument();
    });

    it('restores the default layout', () => {
        renderEditor();
        fireEvent.click(screen.getByText('+ Text'));
        fireEvent.focus(marker('Blau'));
        fireEvent.keyDown(marker('Blau'), { key: 'ArrowLeft' });

        fireEvent.click(screen.getByText('Standard-Anordnung'));

        expect(latest.elements.map(({ type, x, y }) => ({ type, x, y })))
            .toEqual(createDefaultFloorPlan(2).elements.map(({ type, x, y }) => ({ type, x, y })));
    });
});
