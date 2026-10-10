import {
    flagOutline,
    gameControllerOutline,
    medalOutline,
    megaphoneOutline,
    musicalNotesOutline,
    pizzaOutline,
    playOutline,
    playSkipForwardOutline,
    timeOutline,
    trophyOutline,
} from "ionicons/icons";

export const MAX_PROGRAM_ENTRIES = 30;
export const MAX_PROGRAM_TIME_LENGTH = 20;
export const MAX_PROGRAM_TEXT_LENGTH = 60;

// The icons an entry can choose from, with the name the admin sees
export const PROGRAM_ICONS = {
    megaphone: { icon: megaphoneOutline, label: 'Ansage' },
    play: { icon: playOutline, label: 'Runden' },
    pizza: { icon: pizzaOutline, label: 'Essen' },
    final: { icon: playSkipForwardOutline, label: 'Finale' },
    medal: { icon: medalOutline, label: 'Siegerehrung' },
    trophy: { icon: trophyOutline, label: 'Pokal' },
    game: { icon: gameControllerOutline, label: 'Spielen' },
    music: { icon: musicalNotesOutline, label: 'Musik' },
    flag: { icon: flagOutline, label: 'Flagge' },
    time: { icon: timeOutline, label: 'Uhr' },
} as const;

export type ProgramIcon = keyof typeof PROGRAM_ICONS;

export const DEFAULT_PROGRAM_ICON: ProgramIcon = 'time';

export interface ProgramEntry {
    icon: ProgramIcon;
    // Free text such as "16:00 - 16:45" or "21:00"
    time: string;
    text: string;
}

// Shown until an admin saves a programme of their own
export const DEFAULT_PROGRAM: ProgramEntry[] = [
    { icon: 'megaphone', time: '16:00 - 16:45', text: 'Arne labert' },
    { icon: 'play', time: '16:45 - 18:30', text: 'Runde 1 - 5' },
    { icon: 'pizza', time: '18:30 - 19:00', text: 'Pause' },
    { icon: 'play', time: '19:00 - 20:00', text: 'Runde 6 - 8' },
    { icon: 'final', time: '20:00 - 20:45', text: 'Finale' },
    { icon: 'medal', time: '21:00', text: 'Siegerehrung' },
];

export const defaultProgram = (): ProgramEntry[] => DEFAULT_PROGRAM.map(entry => ({ ...entry }));

const sanitizeEntry = (raw: unknown): ProgramEntry | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }
    const candidate = raw as Record<string, unknown>;
    if (typeof candidate.time !== 'string' || typeof candidate.text !== 'string') {
        return null;
    }
    return {
        icon: typeof candidate.icon === 'string' && candidate.icon in PROGRAM_ICONS ? candidate.icon as ProgramIcon : DEFAULT_PROGRAM_ICON,
        time: candidate.time.slice(0, MAX_PROGRAM_TIME_LENGTH),
        text: candidate.text.slice(0, MAX_PROGRAM_TEXT_LENGTH),
    };
};

// Returns null for a missing or unreadable programme; single broken entries are dropped
export const parseProgram = (json: string | null | undefined): ProgramEntry[] | null => {
    if (!json) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(json);
        const entries = (parsed as { entries?: unknown })?.entries;
        if (!Array.isArray(entries)) {
            return null;
        }
        return entries
            .slice(0, MAX_PROGRAM_ENTRIES)
            .map(sanitizeEntry)
            .filter((entry): entry is ProgramEntry => entry !== null);
    } catch {
        return null;
    }
};

export const serializeProgram = (entries: ProgramEntry[]): string => JSON.stringify({ entries });

// The programme to show: the stored one, or the default while none is stored
export const resolveProgram = (json: string | null | undefined): ProgramEntry[] => parseProgram(json) ?? defaultProgram();
