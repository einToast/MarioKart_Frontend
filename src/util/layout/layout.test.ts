import {
    createDefaultFloorPlan,
    createElement,
    FLOOR_PLAN_HEIGHT,
    FLOOR_PLAN_WIDTH,
    FloorPlan,
    isDefaultFloorPlan,
    normalizeRotation,
    parseFloorPlan,
    removeElement,
    serializeFloorPlan,
    syncSwitchMarkers,
    updateElement,
} from './floorPlan';
import { resolveSwitch, suggestSwitch, SWITCH_PALETTE, switchColorStyle } from './switches';

const markers = (plan: FloorPlan) => plan.elements.filter(element => element.type === 'switch');
const markerIndexes = (plan: FloorPlan) => markers(plan).map(element => element.switchIndex);

describe('switches', () => {
    const configured = [{ name: 'Bühne', color: '#112233' }, { name: ' ', color: '' }];

    it('resolves a configured switch to its name and colour', () => {
        expect(resolveSwitch(configured, 0)).toEqual({ name: 'Bühne', color: '#112233' });
    });

    it('numbers a switch without a name and gives it a palette colour', () => {
        expect(resolveSwitch(configured, 1)).toEqual({ name: '2', color: SWITCH_PALETTE[1].color });
    });

    it.each([[undefined], [null], [[]]])('numbers every switch while none is configured (%s)', (switches) => {
        expect(resolveSwitch(switches, 2)).toEqual({ name: '3', color: SWITCH_PALETTE[2].color });
    });

    it('reuses the palette colours for switches beyond the palette', () => {
        expect(resolveSwitch([], SWITCH_PALETTE.length + 1)).toEqual({ name: String(SWITCH_PALETTE.length + 2), color: SWITCH_PALETTE[1].color });
    });

    it('suggests the palette entries in order', () => {
        expect(suggestSwitch([])).toEqual(SWITCH_PALETTE[0]);
        expect(suggestSwitch([SWITCH_PALETTE[0]])).toEqual(SWITCH_PALETTE[1]);
    });

    it('suggests a number when the palette name is taken or used up', () => {
        expect(suggestSwitch([{ name: 'Rot', color: '#000000' }])).toEqual({ name: '2', color: SWITCH_PALETTE[1].color });
        expect(suggestSwitch(SWITCH_PALETTE).name).toBe(String(SWITCH_PALETTE.length + 1));
    });

    it('passes the colour on as a CSS variable', () => {
        expect(switchColorStyle('#DA9DC9')).toEqual({ '--switch-color': '#DA9DC9' });
    });
});

describe('floor plan', () => {
    describe('default layout', () => {
        // Where the switches stand in the classic room, in the order of the switches
        const FRONT = [528, 320];
        const BACK_MIDDLE = [517, 45];
        const BACK_LEFT = [142, 102];
        const BACK_RIGHT = [858, 102];

        it.each([
            [1, [FRONT]],
            [2, [FRONT, BACK_MIDDLE]],
            [3, [FRONT, BACK_RIGHT, BACK_LEFT]],
            [4, [FRONT, BACK_RIGHT, BACK_MIDDLE, BACK_LEFT]],
        ])('uses the classic room for %i switches', (count, positions) => {
            const plan = createDefaultFloorPlan(count);

            expect(markers(plan).map(element => [element.x, element.y])).toEqual(positions);
            expect(markerIndexes(plan)).toEqual(positions.map((_, index) => index));
            expect(plan.outline).toHaveLength(6);
            // One screen per switch plus the drinks counter, which is there together with both exits in every variant
            expect(plan.elements.filter(element => element.type === 'table')).toHaveLength(count + 1);
            expect(plan.elements.filter(element => element.type === 'text').map(element => element.text)).toEqual(['getränke', 'food', 'toilett', '↓', 'food', 'toilett', '↓']);
            // Four rows in front of the main switch, two in front of every other one
            expect(plan.elements.filter(element => element.type === 'row')).toHaveLength(4 + (count - 1) * 2);
        });

        it('turns the corner switches of the classic room towards the audience', () => {
            const [, right, , left] = markers(createDefaultFloorPlan(4));

            expect([right.rotation, left.rotation]).toEqual([15, -15]);
        });

        it('labels the drinks counter and the exits along the walls', () => {
            const texts = createDefaultFloorPlan(4).elements.filter(element => element.type === 'text');
            const counter = createDefaultFloorPlan(4).elements.filter(element => element.type === 'table').at(-1)!;

            expect(texts.filter(element => element.text !== '↓').map(element => element.rotation)).toEqual([-90, -90, -90, -90, -90]);
            expect(texts[0]).toMatchObject({ text: 'getränke', x: counter.x, y: counter.y });
        });

        it('hands out an own copy of the room outline', () => {
            const plan = createDefaultFloorPlan(1);
            plan.outline![0].x = 500;

            expect(createDefaultFloorPlan(1).outline![0].x).toBe(2);
        });

        it.each([5, 8, 12, 16])('places one station per switch on a grid for %i switches', (count) => {
            const plan = createDefaultFloorPlan(count);

            expect(plan.outline).toBeUndefined();
            expect(markerIndexes(plan)).toEqual(Array.from({ length: count }, (_, index) => index));
            expect(plan.elements.filter(element => element.type === 'table')).toHaveLength(count);
            expect(plan.elements.filter(element => element.type === 'row')).toHaveLength(count * 2);
            expect(new Set(plan.elements.map(element => element.id)).size).toBe(plan.elements.length);
            plan.elements.forEach(element => {
                expect(element.x - element.width / 2).toBeGreaterThanOrEqual(0);
                expect(element.x + element.width / 2).toBeLessThanOrEqual(FLOOR_PLAN_WIDTH);
                expect(element.y).toBeGreaterThan(0);
                expect(element.y).toBeLessThan(FLOOR_PLAN_HEIGHT);
            });
            expect(new Set(markers(plan).map(element => `${element.x}/${element.y}`)).size).toBe(count);
        });

        it('is empty without switches', () => {
            expect(createDefaultFloorPlan(0).elements).toEqual([]);
        });

        it.each([0, 1, 3, 4, 6])('recognizes the untouched default for %i switches', (count) => {
            const plan = parseFloorPlan(serializeFloorPlan(createDefaultFloorPlan(count)))!;

            expect(isDefaultFloorPlan(plan, count)).toBe(true);
            expect(isDefaultFloorPlan(plan, count + 1)).toBe(false);
        });

        it('does not take an edited plan for the default', () => {
            const plan = createDefaultFloorPlan(2);

            expect(isDefaultFloorPlan(updateElement(plan, plan.elements[0].id, { x: 100 }), 2)).toBe(false);
            expect(isDefaultFloorPlan({ ...plan, elements: [...plan.elements, createElement(plan, 'text')] }, 2)).toBe(false);
        });
    });

    describe('serialization', () => {
        it('survives a round trip', () => {
            const plan = createDefaultFloorPlan(3);
            plan.elements.push(createElement(plan, 'text', { text: 'Eingang', rotation: 90 }));

            expect(parseFloorPlan(serializeFloorPlan(plan))).toEqual(plan);
        });

        it.each([[null], [undefined], [''], ['not json'], ['[]'], ['{"elements":"none"}'], ['42']])('returns null for %s', (json) => {
            expect(parseFloorPlan(json)).toBeNull();
        });

        it.each([
            ['is missing', undefined],
            ['has too few corners', [{ x: 1, y: 1 }, { x: 2, y: 2 }]],
            ['has a broken corner', [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 'left', y: 3 }]],
            ['is not a list', 'round'],
        ])('frames the plan by the canvas when the outline %s', (_name, outline) => {
            expect(parseFloorPlan(JSON.stringify({ elements: [], outline }))).toEqual({ version: 1, elements: [] });
        });

        it('keeps the corners of the room inside the canvas', () => {
            const outline = [{ x: -5, y: 0 }, { x: 2000, y: 10 }, { x: 500, y: 900 }];

            expect(parseFloorPlan(JSON.stringify({ elements: [], outline }))?.outline)
                .toEqual([{ x: 0, y: 0 }, { x: FLOOR_PLAN_WIDTH, y: 10 }, { x: 500, y: FLOOR_PLAN_HEIGHT }]);
        });

        it('drops broken elements and repairs incomplete ones', () => {
            const plan = parseFloorPlan(JSON.stringify({
                elements: [
                    null,
                    { type: 'sofa', x: 1, y: 1 },
                    { type: 'switch', x: 10, y: 10 },
                    { type: 'switch', id: 'a', x: 5000, y: -20, switchIndex: 1, rotation: 540 },
                    { type: 'table', id: 'a' },
                    { type: 'row' },
                    { type: 'text', text: 'x'.repeat(100), width: 'wide' },
                ],
            }));

            expect(plan?.elements.map(element => element.type)).toEqual(['switch', 'row', 'text']);
            expect(plan?.elements[0]).toMatchObject({ id: 'a', x: FLOOR_PLAN_WIDTH, y: 0, switchIndex: 1, rotation: 180 });
            expect(plan?.elements[1]).toMatchObject({ x: FLOOR_PLAN_WIDTH / 2, y: FLOOR_PLAN_HEIGHT / 2, width: 240 });
            expect(plan?.elements[2].text).toHaveLength(40);
            expect(plan?.elements[2].width).toBe(200);
        });
    });

    describe('switch markers', () => {
        it('adds a marker for every new switch and keeps the placed ones', () => {
            const plan = updateElement(createDefaultFloorPlan(1), createDefaultFloorPlan(1).elements[0].id, {});
            const moved = updateElement(plan, markers(plan)[0].id, { x: 123, y: 456 });

            const synced = syncSwitchMarkers(moved, 3);

            expect(markerIndexes(synced)).toEqual([0, 1, 2]);
            expect(markers(synced)[0]).toMatchObject({ x: 123, y: 456 });
            // New markers take their place in the classic room for that number of switches
            expect(markers(synced)[1]).toMatchObject({ x: 858, y: 102, rotation: 15 });
            expect(synced.outline).toEqual(moved.outline);
        });

        it('removes the markers of removed switches and duplicates but keeps the furniture', () => {
            const plan = createDefaultFloorPlan(3);
            plan.elements.push(createElement(plan, 'switch', { switchIndex: 0 }));

            const synced = syncSwitchMarkers(plan, 2);

            expect(markerIndexes(synced)).toEqual([0, 1]);
            expect(synced.elements.filter(element => element.type === 'table')).toHaveLength(4);
        });

        it('returns the same plan when nothing has to change', () => {
            const plan = createDefaultFloorPlan(2);

            expect(syncSwitchMarkers(plan, 2)).toBe(plan);
        });
    });

    describe('editing', () => {
        it('keeps an element inside the room and its size in range', () => {
            const plan = createDefaultFloorPlan(1);
            const table = plan.elements[0];

            const updated = updateElement(plan, table.id, { x: -50, y: 9999, width: 0, height: 5000, rotation: 270 }).elements[0];

            expect(updated).toMatchObject({ x: 0, y: FLOOR_PLAN_HEIGHT, width: 4, height: FLOOR_PLAN_HEIGHT, rotation: -90 });
        });

        it('ignores values that are not numbers and never changes id or type', () => {
            const plan = createDefaultFloorPlan(1);
            const table = plan.elements[0];

            const updated = updateElement(plan, table.id, { x: Number.NaN, id: 'other', type: 'text' }).elements[0];

            expect(updated).toEqual(table);
        });

        it('limits the text of a label', () => {
            const plan: FloorPlan = { version: 1, elements: [] };
            const label = createElement(plan, 'text');
            plan.elements.push(label);

            expect(updateElement(plan, label.id, { text: 'y'.repeat(60) }).elements[0].text).toHaveLength(40);
        });

        it('removes furniture but not switch markers', () => {
            const plan = createDefaultFloorPlan(1);
            const table = plan.elements.find(element => element.type === 'table')!;
            const marker = markers(plan)[0];

            const withoutTable = removeElement(plan, table.id);

            expect(withoutTable.elements).toHaveLength(plan.elements.length - 1);
            expect(removeElement(withoutTable, marker.id).elements).toHaveLength(withoutTable.elements.length);
        });

        it.each([[0, 0], [180, 180], [181, -179], [-180, 180], [360, 0], [-270, 90], [44.6, 45]])('normalizes a rotation of %s to %s', (rotation, expected) => {
            expect(normalizeRotation(rotation)).toBe(expected);
        });
    });
});
