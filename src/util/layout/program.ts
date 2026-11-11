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
import { ProgramEntry, ProgramRow, TextTranslation } from "../api/config/interfaces";
import { pruneTranslations, sanitizeTranslations } from "../../i18n/translatable";

export const MAX_PROGRAM_ENTRIES = 30;
export const MAX_PROGRAM_TIME_LENGTH = 20;
export const MAX_PROGRAM_TEXT_LENGTH = 60;

// The icons an entry can choose from, with the name the admin sees
export const PROGRAM_ICONS = {
    megaphone: { icon: megaphoneOutline },
    play: { icon: playOutline },
    pizza: { icon: pizzaOutline },
    final: { icon: playSkipForwardOutline },
    medal: { icon: medalOutline },
    trophy: { icon: trophyOutline },
    game: { icon: gameControllerOutline },
    music: { icon: musicalNotesOutline },
    flag: { icon: flagOutline },
    time: { icon: timeOutline },
} as const;

export type ProgramIcon = keyof typeof PROGRAM_ICONS;

export const DEFAULT_PROGRAM_ICON: ProgramIcon = 'time';

// Shown until an admin saves a programme of their own
export const DEFAULT_PROGRAM: ProgramEntry[] = [
    { icon: 'megaphone', time: '16:00 - 16:45', text: 'Arne labert', translations: { en: { text: 'Arne talks' } } },
    { icon: 'play', time: '16:45 - 18:30', text: 'Runde 1 - 5', translations: { en: { text: 'Rounds 1 - 5' } } },
    { icon: 'pizza', time: '18:30 - 19:00', text: 'Pause', translations: { en: { text: 'Break' } } },
    { icon: 'play', time: '19:00 - 20:00', text: 'Runde 6 - 8', translations: { en: { text: 'Rounds 6 - 8' } } },
    { icon: 'final', time: '20:00 - 20:45', text: 'Finale', translations: { en: { text: 'Final' } } },
    { icon: 'medal', time: '21:00', text: 'Siegerehrung', translations: { en: { text: 'Award ceremony' } } },
];

export const defaultProgram = (): ProgramEntry[] => DEFAULT_PROGRAM.map(entry => structuredClone(entry));

let nextProgramRowKey = 0;
export const toProgramRow = (entry: ProgramEntry): ProgramRow => ({ key: nextProgramRowKey++, entry });

const sanitizeEntry = (raw: unknown): ProgramEntry | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }
    const candidate = raw as Record<string, unknown>;
    if (typeof candidate.time !== 'string' || typeof candidate.text !== 'string') {
        return null;
    }
    const entry: ProgramEntry = {
        icon: typeof candidate.icon === 'string' && candidate.icon in PROGRAM_ICONS ? candidate.icon as ProgramIcon : DEFAULT_PROGRAM_ICON,
        time: candidate.time.slice(0, MAX_PROGRAM_TIME_LENGTH),
        text: candidate.text.slice(0, MAX_PROGRAM_TEXT_LENGTH),
    };
    const translations = sanitizeTranslations<TextTranslation>(candidate.translations, { text: { maxLength: MAX_PROGRAM_TEXT_LENGTH } });
    return translations ? { ...entry, translations } : entry;
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

export const serializeProgram = (entries: ProgramEntry[]): string => JSON.stringify({
    entries: entries.map(({ translations, ...entry }) => {
        const pruned = pruneTranslations(translations);
        return pruned ? { ...entry, translations: pruned } : entry;
    }),
});

// The programme to show: the stored one, or the default while none is stored
export const resolveProgram = (json: string | null | undefined): ProgramEntry[] => parseProgram(json) ?? defaultProgram();
