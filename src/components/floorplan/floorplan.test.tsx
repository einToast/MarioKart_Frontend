import { render, screen } from '@testing-library/react';
import { makeSwitches } from '../../test/fixtures';
import { createDefaultFloorPlan, createElement, FloorPlan } from '../../util/layout/floorPlan';
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
