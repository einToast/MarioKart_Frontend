export const convertUmlauts = (text: string): string => {
    const umlautMap = {
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

export enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    FREE_TEXT = "FREE_TEXT",
    CHECKBOX = "CHECKBOX",
    TEAM = "TEAM"
}

export enum ChangeType {
    REGISTRATION = "Registrierung",
    TOURNAMENT = "Turnier",
    SURVEYS = "Umfragen",
    TEAMS = "Teams",
    MATCH_PLAN = "Spielplan",
    FINAL_PLAN = "Finalspiele",
    ALL = "Anwendung"
}

