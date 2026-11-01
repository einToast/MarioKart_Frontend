export const MAX_RELOAD_DELAY_MS = 1000;

export const reloadDelay = (): number => Math.random() * MAX_RELOAD_DELAY_MS;
