import type React from "react";
import { SwitchDTO } from "../api/config/dto";

export const MAX_SWITCHES = 16;
export const MAX_SWITCH_NAME_LENGTH = 30;

// Suggestions for new switches and the colours of switches that are not configured yet
export const SWITCH_PALETTE: SwitchDTO[] = [
    { name: 'Blau', color: '#9DAEDA' },
    { name: 'Rot', color: '#DA9DC9' },
    { name: 'Grün', color: '#9DDAAA' },
    { name: 'Weiß', color: '#ECECEC' },
    { name: 'Gelb', color: '#F5D76E' },
    { name: 'Orange', color: '#F0B27A' },
    { name: 'Türkis', color: '#8FD9D6' },
    { name: 'Lila', color: '#C3A6F0' },
];

export const PAUSE_COLOR = '#F5D76E';

const paletteEntry = (switchIndex: number): SwitchDTO => {
    const index = Number.isInteger(switchIndex) && switchIndex >= 0 ? switchIndex : 0;
    return SWITCH_PALETTE[index % SWITCH_PALETTE.length];
};

// A switch without a configured name is called by its number
export const resolveSwitch = (switches: SwitchDTO[] | undefined | null, switchIndex: number): SwitchDTO => {
    const configured = switches?.[switchIndex];
    return {
        name: configured?.name?.trim() || String(switchIndex + 1),
        color: configured?.color || paletteEntry(switchIndex).color,
    };
};

// The palette entry for the next switch, numbered once the palette names are used up
export const suggestSwitch = (switches: SwitchDTO[]): SwitchDTO => {
    const index = switches.length;
    const suggestion = paletteEntry(index);
    const nameTaken = index >= SWITCH_PALETTE.length || switches.some(existing => existing.name === suggestion.name);
    return {
        name: nameTaken ? String(index + 1) : suggestion.name,
        color: suggestion.color,
    };
};

export const switchColorStyle = (color: string): React.CSSProperties =>
    ({ '--switch-color': color }) as React.CSSProperties;
