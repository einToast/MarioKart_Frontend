export const convertUmlauts = (text: string): string => {
    const umlautMap: Record<string, string> = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'Ä': 'Ae',
        'Ö': 'Oe',
        'Ü': 'Ue',
        'ß': 'ss',
        'ẞ': 'SS'
    };

    return text.split('').map(char => umlautMap[char] || char).join('');
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

export enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    FREE_TEXT = "FREE_TEXT",
    CHECKBOX = "CHECKBOX",
    TEAM = "TEAM",
    TEAM_ONE_FREE_TEXT = "TEAM_ONE_FREE_TEXT"
}

export enum SurveyKeyMode {
    DISABLED = "DISABLED",
    DISTRIBUTING = "DISTRIBUTING",
    REQUIRED = "REQUIRED"
}

export enum ChangeType {
    REGISTRATION = "Registrierung",
    TOURNAMENT = "Turnier",
    SURVEYS = "Umfragen",
    TEAMS = "Teams",
    SCHEDULE = "Spielplan",
    FINAL_SCHEDULE = "Finalspiele",
    ALL = "Anwendung"
}

