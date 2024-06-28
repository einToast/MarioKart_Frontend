interface Team {
    id: number;
    name: string;
    character: string;
    punkte: number;
    switch: string | undefined;
    final_ready: boolean;
}

interface User {
    loggedIn: boolean;
    name: string | null;
    character: string | null;
}

interface LoginProps {
    setUser: (user: User | null) => void
}

interface Character {
    name: string;
    imagePath: string;
}

interface Game {
    id: number,
    switch: string,
    teams: Team[]
}

interface Point {
    id: number,
    final_points: number,
    normal_poins: number,
    team: Team
}

interface Round {
    id: number,
    final: boolean,
    gespielt: boolean,
    von: string,
    bis: string,
    games: Game[]
}

interface Survey {
    id: number,
    active: boolean,
    question: string,
    answerType: string,
    teamCount: 4,
    teams: Team[],
}

interface AdminUser {
    loggedIn: boolean;
    username: string;
    token: string;
}