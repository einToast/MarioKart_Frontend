export const FLOOR_PLAN_VERSION = 1;
export const FLOOR_PLAN_WIDTH = 1000;
export const FLOOR_PLAN_HEIGHT = 640;
export const MAX_FLOOR_PLAN_ELEMENTS = 200;
export const MAX_FLOOR_PLAN_TEXT_LENGTH = 40;

// switch: dot with the switch name, table: outlined box (screen, table, ...),
// row: a line of seats, text: free label
export type FloorPlanElementType = 'switch' | 'table' | 'row' | 'text';

const ELEMENT_TYPES: FloorPlanElementType[] = ['switch', 'table', 'row', 'text'];

export interface FloorPlanElement {
    id: string;
    type: FloorPlanElementType;
    // Centre of the element in plan units
    x: number;
    y: number;
    width: number;
    height: number;
    // Degrees, clockwise
    rotation: number;
    switchIndex?: number;
    text?: string;
}

export interface FloorPlanPoint {
    x: number;
    y: number;
}

export interface FloorPlan {
    version: number;
    elements: FloorPlanElement[];
    // Corners of the room; a plan without an outline is framed by the whole canvas
    outline?: FloorPlanPoint[];
}

const DEFAULT_SIZES: Record<FloorPlanElementType, { width: number; height: number }> = {
    switch: { width: 60, height: 60 },
    table: { width: 260, height: 22 },
    row: { width: 240, height: 4 },
    text: { width: 200, height: 40 },
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const toNumber = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

let idCounter = 0;
const nextId = (elements: FloorPlanElement[], type: FloorPlanElementType): string => {
    let id: string;
    do {
        idCounter += 1;
        id = `${type}-${idCounter}`;
    } while (elements.some(element => element.id === id));
    return id;
};

export const normalizeRotation = (rotation: number): number => {
    const normalized = Math.round(rotation) % 360;
    if (normalized > 180) {
        return normalized - 360;
    }
    return normalized <= -180 ? normalized + 360 : normalized;
};

const sanitizeElement = (raw: unknown, index: number): FloorPlanElement | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }
    const candidate = raw as Record<string, unknown>;
    const type = candidate.type as FloorPlanElementType;
    if (!ELEMENT_TYPES.includes(type)) {
        return null;
    }
    if (type === 'switch' && !(Number.isInteger(candidate.switchIndex) && (candidate.switchIndex as number) >= 0)) {
        return null;
    }

    const element: FloorPlanElement = {
        id: typeof candidate.id === 'string' && candidate.id ? candidate.id : `${type}-loaded-${index}`,
        type,
        x: clamp(toNumber(candidate.x, FLOOR_PLAN_WIDTH / 2), 0, FLOOR_PLAN_WIDTH),
        y: clamp(toNumber(candidate.y, FLOOR_PLAN_HEIGHT / 2), 0, FLOOR_PLAN_HEIGHT),
        width: clamp(toNumber(candidate.width, DEFAULT_SIZES[type].width), 4, FLOOR_PLAN_WIDTH),
        height: clamp(toNumber(candidate.height, DEFAULT_SIZES[type].height), 4, FLOOR_PLAN_HEIGHT),
        rotation: normalizeRotation(toNumber(candidate.rotation, 0)),
    };
    if (type === 'switch') {
        element.switchIndex = candidate.switchIndex as number;
    }
    if (type === 'text') {
        element.text = String(candidate.text ?? '').slice(0, MAX_FLOOR_PLAN_TEXT_LENGTH);
    }
    return element;
};

const MAX_OUTLINE_POINTS = 50;

const sanitizeOutline = (raw: unknown): FloorPlanPoint[] | undefined => {
    if (!Array.isArray(raw) || raw.length < 3 || raw.length > MAX_OUTLINE_POINTS) {
        return undefined;
    }
    const valid = raw.every(point => typeof point === 'object' && point !== null
        && Number.isFinite((point as FloorPlanPoint).x) && Number.isFinite((point as FloorPlanPoint).y));
    if (!valid) {
        return undefined;
    }
    return (raw as FloorPlanPoint[]).map(point => ({
        x: clamp(point.x, 0, FLOOR_PLAN_WIDTH),
        y: clamp(point.y, 0, FLOOR_PLAN_HEIGHT),
    }));
};

const withOutline = (elements: FloorPlanElement[], outline: FloorPlanPoint[] | undefined): FloorPlan =>
    outline ? { version: FLOOR_PLAN_VERSION, elements, outline } : { version: FLOOR_PLAN_VERSION, elements };

// Returns null for a missing or unreadable plan; single broken elements are dropped
export const parseFloorPlan = (json: string | null | undefined): FloorPlan | null => {
    if (!json) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(json);
        if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as FloorPlan).elements)) {
            return null;
        }
        const elements: FloorPlanElement[] = [];
        (parsed as FloorPlan).elements.slice(0, MAX_FLOOR_PLAN_ELEMENTS).forEach((raw, index) => {
            const element = sanitizeElement(raw, index);
            if (element && !elements.some(existing => existing.id === element.id)) {
                elements.push(element);
            }
        });
        return withOutline(elements, sanitizeOutline((parsed as FloorPlan).outline));
    } catch {
        return null;
    }
};

export const serializeFloorPlan = (plan: FloorPlan): string =>
    JSON.stringify(withOutline(plan.elements, plan.outline));

export const createElement = (
    plan: FloorPlan,
    type: FloorPlanElementType,
    overrides: Partial<Omit<FloorPlanElement, 'id' | 'type'>> = {}
): FloorPlanElement => ({
    id: nextId(plan.elements, type),
    type,
    x: FLOOR_PLAN_WIDTH / 2,
    y: FLOOR_PLAN_HEIGHT / 2,
    ...DEFAULT_SIZES[type],
    rotation: 0,
    ...(type === 'text' ? { text: 'Text' } : {}),
    ...overrides,
});

type ElementOverrides = Partial<Omit<FloorPlanElement, 'id' | 'type'>>;

interface Station {
    // Position of the switch marker; its rotation tilts the name the same way as the screen
    marker: ElementOverrides;
    furniture: { type: FloorPlanElementType; overrides: ElementOverrides }[];
}

// The room of the classic tournament: the main switch in front of the audience, one switch
// in the middle of the back wall and one in each back corner, turned towards the room
const VENUE_OUTLINE: FloorPlanPoint[] = [
    { x: 2, y: 2 }, { x: 998, y: 2 }, { x: 998, y: 533 }, { x: 712, y: 636 }, { x: 348, y: 636 }, { x: 2, y: 533 },
];

const VENUE_FRONT: Station = {
    marker: { x: 528, y: 320 },
    furniture: [
        { type: 'table', overrides: { x: 530, y: 299, width: 372, height: 16 } },
        ...[428, 482, 538, 599].map(y => ({ type: 'row' as const, overrides: { x: 530, y, width: 349 } })),
    ],
};

const VENUE_BACK_MIDDLE: Station = {
    marker: { x: 517, y: 45 },
    furniture: [
        { type: 'table', overrides: { x: 507, y: 29, width: 276, height: 16 } },
        { type: 'row', overrides: { x: 508, y: 167, width: 220 } },
        { type: 'row', overrides: { x: 508, y: 212, width: 220 } },
    ],
};

const VENUE_BACK_LEFT: Station = {
    marker: { x: 142, y: 102, rotation: -15 },
    furniture: [
        { type: 'table', overrides: { x: 148, y: 75, width: 176, height: 16, rotation: -15 } },
        { type: 'row', overrides: { x: 181, y: 190, width: 169, rotation: -15 } },
        { type: 'row', overrides: { x: 193, y: 233, width: 169, rotation: -15 } },
    ],
};

const VENUE_BACK_RIGHT: Station = {
    marker: { x: 858, y: 102, rotation: 15 },
    furniture: [
        { type: 'table', overrides: { x: 858, y: 80, width: 176, height: 16, rotation: 15 } },
        { type: 'row', overrides: { x: 836, y: 190, width: 169, rotation: 15 } },
        { type: 'row', overrides: { x: 824, y: 233, width: 169, rotation: 15 } },
    ],
};

// One of the two ways out to the food and the toilets, labelled along the walking direction
const venueExit = (x: number): Station['furniture'] => [
    { type: 'text', overrides: { x: x - 27, y: 440, width: 100, height: 48, rotation: -90, text: 'food' } },
    { type: 'text', overrides: { x: x + 12, y: 425, width: 140, height: 48, rotation: -90, text: 'toilett' } },
    { type: 'text', overrides: { x, y: 540, width: 40, height: 70, text: '↓' } },
];

// Present in the room regardless of the number of switches: the drinks counter on the left
// and the two ways out
const VENUE_FIXTURES: Station['furniture'] = [
    { type: 'table', overrides: { x: 57, y: 406, width: 51, height: 212 } },
    { type: 'text', overrides: { x: 57, y: 406, width: 190, height: 48, rotation: -90, text: 'getränke' } },
    ...venueExit(195),
    ...venueExit(857),
];

// Stations in the order of the switches, for every number of switches the room is laid out for
const VENUE_STATIONS: Record<number, Station[]> = {
    1: [VENUE_FRONT],
    2: [VENUE_FRONT, VENUE_BACK_MIDDLE],
    3: [VENUE_FRONT, VENUE_BACK_RIGHT, VENUE_BACK_LEFT],
    4: [VENUE_FRONT, VENUE_BACK_RIGHT, VENUE_BACK_MIDDLE, VENUE_BACK_LEFT],
};

const stationLines = (count: number): number => Math.ceil(Math.max(count, 1) / 4);

// Distance between the screen of a station and its rows of seats; lines of stations move
// closer together the more of them share the room
const seatOffsets = (count: number): number[] => {
    const lineHeight = FLOOR_PLAN_HEIGHT / stationLines(count);
    return [Math.min(95, lineHeight * 0.5), Math.min(135, lineHeight * 0.72)];
};

// Centre of the station of a switch: stations are spread over up to four columns per line
const stationCentre = (position: number, count: number): { x: number; y: number } => {
    const columns = Math.min(Math.max(count, 1), 4);
    const lines = stationLines(count);
    const line = Math.floor(position / columns);
    const itemsInLine = line === lines - 1 ? count - line * columns : columns;
    const column = position % columns;
    return {
        x: (FLOOR_PLAN_WIDTH / (itemsInLine + 1)) * (column + 1),
        y: (FLOOR_PLAN_HEIGHT / lines) * line + Math.min(70, (FLOOR_PLAN_HEIGHT / lines) * 0.2),
    };
};

const stationWidth = (count: number): number => Math.min(260, FLOOR_PLAN_WIDTH / (Math.min(Math.max(count, 1), 4) + 1) - 30);

// A screen with the switch on it and two rows of seats in front of it
const createStation = (plan: FloorPlan, switchIndex: number, count: number): FloorPlanElement[] => {
    const { x, y } = stationCentre(switchIndex, count);
    const width = stationWidth(count);
    const elements: FloorPlanElement[] = [];
    const add = (type: FloorPlanElementType, overrides: ElementOverrides) => {
        elements.push(createElement({ ...plan, elements: [...plan.elements, ...elements] }, type, overrides));
    };
    add('table', { x, y, width });
    seatOffsets(count).forEach(offset => add('row', { x, y: Math.round(y + offset), width: width - 30 }));
    add('switch', { x, y: y + 12, switchIndex });
    return elements;
};

const createVenuePlan = (stations: Station[]): FloorPlan => {
    const plan: FloorPlan = { version: FLOOR_PLAN_VERSION, elements: [], outline: VENUE_OUTLINE.map(point => ({ ...point })) };
    const add = (type: FloorPlanElementType, overrides: ElementOverrides) => {
        plan.elements.push(createElement(plan, type, overrides));
    };
    stations.forEach(station => station.furniture.forEach(({ type, overrides }) => add(type, overrides)));
    VENUE_FIXTURES.forEach(({ type, overrides }) => add(type, overrides));
    stations.forEach((station, switchIndex) => add('switch', { ...station.marker, switchIndex }));
    return plan;
};

// One to four switches get the classic room, more switches are laid out on a grid
export const createDefaultFloorPlan = (switchCount: number): FloorPlan => {
    const venue = VENUE_STATIONS[switchCount];
    if (venue) {
        return createVenuePlan(venue);
    }

    const plan: FloorPlan = { version: FLOOR_PLAN_VERSION, elements: [] };
    for (let switchIndex = 0; switchIndex < switchCount; switchIndex++) {
        plan.elements.push(...createStation(plan, switchIndex, switchCount));
    }
    return plan;
};

const defaultMarker = (switchIndex: number, switchCount: number): ElementOverrides => {
    const station = VENUE_STATIONS[switchCount]?.[switchIndex];
    if (station) {
        return station.marker;
    }
    const { x, y } = stationCentre(switchIndex, switchCount);
    return { x, y: y + 12 };
};

const comparable = (plan: FloorPlan): string =>
    JSON.stringify([plan.outline ?? null, plan.elements.map(({ id: _id, ...element }) => element)]);

// Whether the plan still is the untouched default for that number of switches
export const isDefaultFloorPlan = (plan: FloorPlan, switchCount: number): boolean =>
    comparable(plan) === comparable(createDefaultFloorPlan(switchCount));

// Keeps exactly one marker per configured switch: markers of removed switches are dropped,
// new switches get a marker at a free default position
export const syncSwitchMarkers = (plan: FloorPlan, switchCount: number): FloorPlan => {
    const seen = new Set<number>();
    const elements = plan.elements.filter(element => {
        if (element.type !== 'switch') {
            return true;
        }
        const switchIndex = element.switchIndex ?? -1;
        if (switchIndex >= switchCount || seen.has(switchIndex)) {
            return false;
        }
        seen.add(switchIndex);
        return true;
    });

    const synced = withOutline(elements, plan.outline);
    for (let switchIndex = 0; switchIndex < switchCount; switchIndex++) {
        if (!seen.has(switchIndex)) {
            synced.elements.push(createElement(synced, 'switch', { ...defaultMarker(switchIndex, switchCount), switchIndex }));
        }
    }

    const unchanged = synced.elements.length === plan.elements.length
        && synced.elements.every((element, index) => element === plan.elements[index]);
    return unchanged ? plan : synced;
};

export const updateElement = (plan: FloorPlan, id: string, changes: Partial<FloorPlanElement>): FloorPlan => ({
    ...plan,
    elements: plan.elements.map(element => {
        if (element.id !== id) {
            return element;
        }
        const updated = { ...element, ...changes, id: element.id, type: element.type };
        return {
            ...updated,
            x: clamp(toNumber(updated.x, element.x), 0, FLOOR_PLAN_WIDTH),
            y: clamp(toNumber(updated.y, element.y), 0, FLOOR_PLAN_HEIGHT),
            width: clamp(toNumber(updated.width, element.width), 4, FLOOR_PLAN_WIDTH),
            height: clamp(toNumber(updated.height, element.height), 4, FLOOR_PLAN_HEIGHT),
            rotation: normalizeRotation(toNumber(updated.rotation, element.rotation)),
            ...(element.type === 'text' ? { text: String(updated.text ?? '').slice(0, MAX_FLOOR_PLAN_TEXT_LENGTH) } : {}),
        };
    }),
});

// Switch markers belong to the switch list and cannot be removed from the plan
export const removeElement = (plan: FloorPlan, id: string): FloorPlan => ({
    ...plan,
    elements: plan.elements.filter(element => element.id !== id || element.type === 'switch'),
});
