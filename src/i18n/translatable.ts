import { DEFAULT_LANGUAGE } from './languages';

export type TranslatableValue = string | string[];

export type TranslatableFields = Record<string, TranslatableValue>;

export type Translations<T extends TranslatableFields> = Partial<Record<string, Partial<T>>>;

export interface Translatable<T extends TranslatableFields> {
    translations?: Translations<T>;
}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

export const localize = <T extends { translations?: object }>(item: T, language: string): T => {
    if (language === DEFAULT_LANGUAGE || !item.translations) {
        return item;
    }
    const overlay = (item.translations as Record<string, Record<string, unknown> | undefined>)[language];
    if (!overlay) {
        return item;
    }
    const localized: Record<string, unknown> = { ...item };
    for (const [field, value] of Object.entries(overlay)) {
        const base = localized[field];
        if (Array.isArray(value) && Array.isArray(base)) {
            localized[field] = base.map((entry, index) => hasText(value[index]) ? value[index] : entry);
        } else if (hasText(value)) {
            localized[field] = value;
        }
    }
    return localized as T;
};

export const translatedValue = <T extends TranslatableFields, K extends keyof T & string>(
    item: Pick<T, K> & Translatable<T>,
    field: K,
    language: string,
): T[K] | undefined =>
    language === DEFAULT_LANGUAGE ? (item as Pick<T, K>)[field] : item.translations?.[language]?.[field];

export const setTranslation = <T extends TranslatableFields, K extends keyof T & string>(
    translations: Translations<T> | undefined,
    language: string,
    field: K,
    value: T[K],
): Translations<T> => ({
    ...translations,
    [language]: { ...translations?.[language], [field]: value },
}) as Translations<T>;

export const translatedChange = <T extends TranslatableFields, K extends keyof T & string>(
    item: Translatable<T>,
    field: K,
    language: string,
    value: T[K],
): Partial<Pick<T, K>> & Translatable<T> =>
    language === DEFAULT_LANGUAGE
        ? { [field]: value } as Partial<Pick<T, K>>
        : { translations: setTranslation(item.translations, language, field, value) } as Partial<Pick<T, K>> & Translatable<T>;

export const pruneTranslations = <T extends TranslatableFields>(translations: Translations<T> | undefined): Translations<T> | undefined => {
    const pruned: Record<string, TranslatableFields> = {};
    for (const [language, fields] of Object.entries(translations ?? {})) {
        if (language === DEFAULT_LANGUAGE || !fields) {
            continue;
        }
        const kept: TranslatableFields = {};
        for (const [field, value] of Object.entries(fields)) {
            if (Array.isArray(value)) {
                const trimmed = value.map(entry => typeof entry === 'string' ? entry.trim() : '');
                if (trimmed.some(entry => entry !== '')) {
                    kept[field] = trimmed;
                }
            } else if (hasText(value)) {
                kept[field] = value.trim();
            }
        }
        if (Object.keys(kept).length > 0) {
            pruned[language] = kept;
        }
    }
    return Object.keys(pruned).length > 0 ? pruned as Translations<T> : undefined;
};

export const sanitizeTranslations = <T extends TranslatableFields>(
    raw: unknown,
    fields: Record<keyof T & string, { maxLength: number; list?: boolean }>,
): Translations<T> | undefined => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return undefined;
    }
    const sanitized: Record<string, Record<string, TranslatableValue>> = {};
    for (const [language, candidate] of Object.entries(raw)) {
        if (typeof candidate !== 'object' || candidate === null) {
            continue;
        }
        const kept: Record<string, TranslatableValue> = {};
        for (const [field, { maxLength, list }] of Object.entries(fields) as [string, { maxLength: number; list?: boolean }][]) {
            const value = (candidate as Record<string, unknown>)[field];
            if (list && Array.isArray(value)) {
                kept[field] = value.map(entry => typeof entry === 'string' ? entry.slice(0, maxLength) : '');
            } else if (!list && typeof value === 'string') {
                kept[field] = value.slice(0, maxLength);
            }
        }
        sanitized[language] = kept;
    }
    return pruneTranslations(sanitized) as Translations<T> | undefined;
};
