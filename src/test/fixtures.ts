import {
    AnswerReturnDTO,
    BreakReturnDTO,
    GameReturnDTO,
    PointsReturnDTO,
    QuestionReturnDTO,
    RoundReturnDTO,
    TeamReturnDTO,
} from '../util/api/config/dto';
import { User } from '../util/api/config/interfaces';
import { QuestionType } from '../util/service/util';

export const makeTeam = (overrides: Partial<TeamReturnDTO> = {}): TeamReturnDTO => ({
    id: 1,
    teamName: 'Team Mario',
    character: { id: 1, characterName: 'Mario' },
    finalReady: true,
    active: true,
    groupPoints: 0,
    finalPoints: 0,
    numberOfGamesPlayed: 0,
    ...overrides,
});

// Four distinct teams with ids 1-4, as they appear in a regular game
export const makeTeams = (): TeamReturnDTO[] => [
    makeTeam({ id: 1, teamName: 'Team Mario', character: { id: 1, characterName: 'Mario' } }),
    makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' } }),
    makeTeam({ id: 3, teamName: 'Team Peach', character: { id: 3, characterName: 'Peach' } }),
    makeTeam({ id: 4, teamName: 'Team Toad', character: { id: 4, characterName: 'Toad' } }),
];

export const makePoints = (team: TeamReturnDTO, points: number, id = team.id * 10): PointsReturnDTO => ({
    id,
    points,
    team,
});

export const makeGame = (overrides: Partial<GameReturnDTO> = {}): GameReturnDTO => {
    const teams = overrides.teams ?? makeTeams();
    return {
        id: 1,
        switchGame: 'Rot',
        teams,
        points: teams.map(team => makePoints(team, 0)),
        ...overrides,
    };
};

export const makeRound = (overrides: Partial<RoundReturnDTO> = {}): RoundReturnDTO => ({
    id: 1,
    roundNumber: 1,
    startTime: '2025-01-08T16:45:00',
    endTime: '2025-01-08T17:05:00',
    finalGame: false,
    played: false,
    games: [makeGame()],
    ...overrides,
});

export const makeBreak = (overrides: Partial<BreakReturnDTO> = {}): BreakReturnDTO => ({
    id: 1,
    startTime: '2025-01-08T18:30:00',
    endTime: '2025-01-08T19:00:00',
    breakEnded: false,
    ...overrides,
});

export const makeQuestion = (overrides: Partial<QuestionReturnDTO> = {}): QuestionReturnDTO => ({
    id: 1,
    questionText: 'Wer gewinnt?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: ['Mario', 'Luigi', 'Peach', 'Toad'],
    active: true,
    visible: true,
    live: false,
    finalTeamsOnly: false,
    oneAnswerPerKey: false,
    ...overrides,
});

export const makeAnswer = (overrides: Partial<AnswerReturnDTO> = {}): AnswerReturnDTO => ({
    questionId: 1,
    answerType: QuestionType.MULTIPLE_CHOICE,
    freeTextAnswer: '',
    multipleChoiceSelectedOption: -1,
    checkboxSelectedOptions: [],
    teamSelectedOption: -1,
    ...overrides,
});

export const makeUser = (overrides: Partial<User> = {}): User => ({
    teamId: 1,
    name: 'Team Mario',
    character: 'Mario',
    ...overrides,
});
