import type React from "react";
import { SwitchDTO } from "../api/config/dto";
import { SwitchRow } from "../api/config/interfaces";
import { inBaseLanguage } from "../../i18n/translatable";

export const MAX_SWITCHES = 16;
export const MAX_SWITCH_NAME_LENGTH = 30;

// Suggestions for new switches and the colours of switches that are not configured yet
const PALETTE = [
    { color: '#9DAEDA', names: { de: 'Blau', en: 'Blue' } },
    { color: '#DA9DC9', names: { de: 'Rot', en: 'Red' } },
    { color: '#9DDAAA', names: { de: 'Grün', en: 'Green' } },
    { color: '#ECECEC', names: { de: 'Weiß', en: 'White' } },
    { color: '#F5D76E', names: { de: 'Gelb', en: 'Yellow' } },
    { color: '#F0B27A', names: { de: 'Orange', en: 'Orange' } },
    { color: '#8FD9D6', names: { de: 'Türkis', en: 'Turquoise' } },
    { color: '#C3A6F0', names: { de: 'Lila', en: 'Purple' } },
];

export const switchPalette = (): SwitchDTO[] => PALETTE.map(({ color, names }) => ({ color, ...inBaseLanguage('name', names) }));

export const PAUSE_COLOR = '#F5D76E';

const paletteIndex = (switchIndex: number): number => {
    const index = Number.isInteger(switchIndex) && switchIndex >= 0 ? switchIndex : 0;
    return index % PALETTE.length;
};

// A switch without a configured name is called by its number
export const resolveSwitch = (switches: SwitchDTO[] | undefined | null, switchIndex: number): SwitchDTO => {
    const configured = switches?.[switchIndex];
    return {
        name: configured?.name?.trim() || String(switchIndex + 1),
        color: configured?.color || PALETTE[paletteIndex(switchIndex)].color,
    };
};

// The palette entry for the next switch, numbered once the palette names are used up
export const suggestSwitch = (switches: SwitchDTO[]): SwitchDTO => {
    const index = switches.length;
    const suggestion = switchPalette()[paletteIndex(index)];
    const nameTaken = index >= PALETTE.length || switches.some(existing => existing.name === suggestion.name);
    return nameTaken ? { name: String(index + 1), color: suggestion.color } : suggestion;
};

let nextSwitchRowKey = 0;
export const toSwitchRow = (gameSwitch: SwitchDTO): SwitchRow => ({ key: nextSwitchRowKey++, gameSwitch });

export const switchColorStyle =(color: string): React.CSSProperties =>
    ({ '--switch-color': color }) as React.CSSProperties;
