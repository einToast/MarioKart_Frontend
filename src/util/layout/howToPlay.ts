import i18n, { loadLanguage } from "../../i18n";
import { DEFAULT_LANGUAGE, TRANSLATION_LANGUAGES } from "../../i18n/languages";
import { pruneTranslations, sanitizeTranslations } from "../../i18n/translatable";
import { HowToPlay, HowToPlayRule, HowToPlayRuleRow, TextTranslation } from "../api/config/interfaces";

export const MAX_RULES = 30;
export const MAX_RULE_TEXT_LENGTH = 200;
export const MAX_VIDEO_URL_LENGTH = 200;
export const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=3p25Jjj6UGA';

const YOUTUBE_VIDEO = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[?&#/].*)?$/;

export const youtubeEmbedUrl = (url: string): string | null => {
    const match = YOUTUBE_VIDEO.exec(url.trim());
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const rulesIn = (language: string): string[] => {
    const rules: unknown = i18n.t('howToPlay.rules', { lng: language, returnObjects: true });
    return Array.isArray(rules) ? rules.filter((rule): rule is string => typeof rule === 'string') : [];
};

export const defaultHowToPlay = async (): Promise<HowToPlay> => {
    await Promise.all(TRANSLATION_LANGUAGES.map(language => loadLanguage(language)));
    const translatedRules = TRANSLATION_LANGUAGES.map(language => [language, rulesIn(language)] as const);
    return {
        videoUrl: DEFAULT_VIDEO_URL,
        rules: rulesIn(DEFAULT_LANGUAGE).map((text, index) => {
            const translations = Object.fromEntries(translatedRules
                .filter(([, rules]) => rules[index])
                .map(([language, rules]) => [language, { text: rules[index] }]));
            return Object.keys(translations).length > 0 ? { text, translations } : { text };
        }),
    };
};

let nextRuleRowKey = 0;
export const toRuleRow = (rule: HowToPlayRule): HowToPlayRuleRow => ({ key: nextRuleRowKey++, rule });

const sanitizeRule = (raw: unknown): HowToPlayRule | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }
    const candidate = raw as Record<string, unknown>;
    if (typeof candidate.text !== 'string') {
        return null;
    }
    const rule: HowToPlayRule = { text: candidate.text.slice(0, MAX_RULE_TEXT_LENGTH) };
    const translations = sanitizeTranslations<TextTranslation>(candidate.translations, { text: { maxLength: MAX_RULE_TEXT_LENGTH } });
    return translations ? { ...rule, translations } : rule;
};

export const parseHowToPlay = (json: string | null | undefined): HowToPlay | null => {
    if (!json) {
        return null;
    }
    try {
        const parsed = JSON.parse(json) as { videoUrl?: unknown; rules?: unknown } | null;
        if (!Array.isArray(parsed?.rules)) {
            return null;
        }
        return {
            videoUrl: typeof parsed.videoUrl === 'string' ? parsed.videoUrl.slice(0, MAX_VIDEO_URL_LENGTH) : '',
            rules: parsed.rules
                .slice(0, MAX_RULES)
                .map(sanitizeRule)
                .filter((rule): rule is HowToPlayRule => rule !== null),
        };
    } catch {
        return null;
    }
};

export const serializeHowToPlay = (howToPlay: HowToPlay): string => JSON.stringify({
    videoUrl: howToPlay.videoUrl,
    rules: howToPlay.rules.map(({ translations, ...rule }) => {
        const pruned = pruneTranslations(translations);
        return pruned ? { ...rule, translations: pruned } : rule;
    }),
});
