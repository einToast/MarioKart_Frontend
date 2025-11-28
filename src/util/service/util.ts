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
    TEAM = "TEAM",
    TEAM_ONE_FREE_TEXT = "TEAM_ONE_FREE_TEXT"
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

