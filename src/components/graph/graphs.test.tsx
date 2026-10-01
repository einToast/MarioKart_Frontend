import { createEvent, fireEvent, render, waitFor } from '@testing-library/react';
import type { Scale } from 'chart.js';
import { barPosition, chartContext, completeChartAnimation, fakeChart, lastBarProps } from '../../test/charts';
import { makeQuestion, makeTeam } from '../../test/fixtures';
import { QuestionReturnDTO, TeamReturnDTO } from '../../util/api/config/dto';
import FinalGraph from './FinalGraph';
import GroupGraph from './GroupGraph';
import QuestionGraph from './QuestionGraph';
import StaticTeamGraph from './StaticTeamGraph';

const GOLD = '#FFD700';
const SILVER = '#C0C0C0';
const BRONZE = '#CD7F32';
const GREY = '#696969';
const HIDDEN = '#6351F9';

const team = (id: number, name: string, groupPoints: number, finalPoints = 0): TeamReturnDTO =>
    makeTeam({ id, teamName: `Team ${name}`, character: { id, characterName: name }, groupPoints, finalPoints });

/** jsdom never loads images; this stand-in reports every image as loaded right away. */
class LoadedImage {
    onload: (() => void) | null = null;
    private source = '';

    get src() {
        return this.source;
    }

    set src(value: string) {
        this.source = `${window.location.origin}${value}`;
        queueMicrotask(() => this.onload?.());
    }
}

const loadImagesInstantly = () => vi.stubGlobal('Image', LoadedImage);

const labels = () => lastBarProps().data.labels;
const data = () => lastBarProps().data.datasets[0].data;
const colors = () => lastBarProps().data.datasets[0].backgroundColor;
const yAxis = () => lastBarProps().options.scales?.y as { max: number; ticks: { display?: boolean; callback: (value: number | string) => unknown } };
const xAxis = () => lastBarProps().options.scales?.x as { ticks: { display?: boolean } };
const tickLabel = (value: number | string) => yAxis().ticks.callback.call({} as Scale, value);

const pressKey = (key: string) => fireEvent.keyDown(window, { key });
const pressTimes = (times: number) => {
    for (let i = 0; i < times; i++) {
        pressKey('ArrowRight');
    }
};

/** File names of the images drawn onto the canvas, in drawing order. */
const drawnImages = () => chartContext.drawImage.mock.calls.map(call => (call[0] as LoadedImage).src.split('/').pop());
/** [text, x, y] of everything written onto the canvas, in drawing order. */
const writtenTexts = () => chartContext.fillText.mock.calls;

const waitForImages = async () => {
    await waitFor(() => expect(chartContext.drawImage).toHaveBeenCalled());
    chartContext.drawImage.mockClear();
    chartContext.fillText.mockClear();
};

afterEach(() => {
    vi.unstubAllGlobals();
    window.innerWidth = 1024;
});

describe('StaticTeamGraph', () => {
    const teams = () => [team(1, 'Mario', 10), team(2, 'Luigi', 30), team(3, 'Peach', 20), team(4, 'Toad', 0)];

    it('charts the teams by group points, best first', () => {
        render(<StaticTeamGraph teams={teams()} />);

        expect(labels()).toEqual(['Team Luigi', 'Team Peach', 'Team Mario', 'Team Toad']);
        expect(data()).toEqual([30, 20, 10, 0]);
    });

    it('does not reorder the list it was given', () => {
        const given = teams();

        render(<StaticTeamGraph teams={given} />);

        expect(given.map(t => t.teamName)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad']);
    });

    it('leaves 20% headroom above the best score and does not label the top of the axis', () => {
        render(<StaticTeamGraph teams={teams()} />);

        expect(yAxis().max).toBe(36);
        expect(tickLabel(36)).toBeNull();
        expect(tickLabel(30)).toBe(30);
        expect(tickLabel('12.5')).toBe(12.5);
    });

    it('shows axis labels on wide screens', () => {
        render(<StaticTeamGraph teams={teams()} />);

        expect(yAxis().ticks.display).toBe(true);
        expect(xAxis().ticks.display).toBe(true);
    });

    it('hides axis labels on narrow screens', () => {
        window.innerWidth = 500;

        render(<StaticTeamGraph teams={teams()} />);

        expect(yAxis().ticks.display).toBe(false);
        expect(xAxis().ticks.display).toBe(false);
    });

    it('adapts the axis labels and redraws when the window is resized', () => {
        render(<StaticTeamGraph teams={teams()} />);

        window.innerWidth = 500;
        fireEvent(window, new Event('resize'));

        expect(yAxis().ticks.display).toBe(false);
        expect(fakeChart.update).toHaveBeenCalled();
    });

    it('draws each character above its bar and each score inside it', async () => {
        loadImagesInstantly();
        render(<StaticTeamGraph teams={teams()} />);
        await waitForImages();

        completeChartAnimation();

        expect(drawnImages()).toEqual(['Luigi.png', 'Peach.png', 'Mario.png', 'Toad.png']);
        expect(chartContext.drawImage.mock.calls[0].slice(1)).toEqual([barPosition(0).x - 20, barPosition(0).y - 40, 40, 40]);
        expect(writtenTexts()).toEqual([
            ['30', barPosition(0).x, barPosition(0).y + 30],
            ['20', barPosition(1).x, barPosition(1).y + 30],
            ['10', barPosition(2).x, barPosition(2).y + 30],
        ]);
    });

    it('draws smaller characters and no scores on narrow screens', async () => {
        window.innerWidth = 500;
        loadImagesInstantly();
        render(<StaticTeamGraph teams={teams()} />);
        await waitForImages();

        completeChartAnimation();

        expect(chartContext.drawImage.mock.calls[0].slice(1)).toEqual([barPosition(0).x - 15, barPosition(0).y - 20, 30, 30]);
        expect(writtenTexts()).toEqual([]);
    });

    it('draws the scores even before the characters have loaded', () => {
        render(<StaticTeamGraph teams={teams()} />);
        chartContext.fillText.mockClear();

        completeChartAnimation();

        expect(chartContext.drawImage).not.toHaveBeenCalled();
        expect(writtenTexts().map(call => call[0])).toEqual(['30', '20', '10']);
    });

    it('renders an empty chart without teams', () => {
        render(<StaticTeamGraph teams={[]} />);

        expect(labels()).toEqual([]);
        expect(data()).toEqual([]);
    });
});

describe('GroupGraph', () => {
    /** Mario and Toad share the last place. */
    const teams = () => [team(1, 'Mario', 10), team(2, 'Luigi', 30), team(3, 'Peach', 20), team(4, 'Toad', 10)];

    it('starts with the scores visible but the teams hidden behind their places', () => {
        render(<GroupGraph teams={teams()} />);

        expect(data()).toEqual([30, 20, 10, 10]);
        expect(labels()).toEqual(['1. Platz', '2. Platz', '3. Platz', '4. Platz']);
    });

    it('reveals the teams from the last place upwards, tied teams together', () => {
        render(<GroupGraph teams={teams()} />);

        pressKey('ArrowRight');
        expect(labels()).toEqual(['1. Platz', '2. Platz', 'Team Mario', 'Team Toad']);

        pressKey('ArrowRight');
        expect(labels()).toEqual(['1. Platz', 'Team Peach', 'Team Mario', 'Team Toad']);

        pressKey('ArrowRight');
        expect(labels()).toEqual(['Team Luigi', 'Team Peach', 'Team Mario', 'Team Toad']);
    });

    it('keeps everything revealed when the presentation is advanced further', () => {
        render(<GroupGraph teams={teams()} />);

        pressTimes(10);

        expect(labels()).toEqual(['Team Luigi', 'Team Peach', 'Team Mario', 'Team Toad']);
    });

    it.each([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'PageDown', 'PageUp'])('advances with the "%s" key', (key) => {
        render(<GroupGraph teams={teams()} />);

        pressKey(key);

        expect(labels()).toEqual(['1. Platz', '2. Platz', 'Team Mario', 'Team Toad']);
    });

    it('ignores other keys', () => {
        render(<GroupGraph teams={teams()} />);

        pressKey('a');

        expect(labels()).toEqual(['1. Platz', '2. Platz', '3. Platz', '4. Platz']);
    });

    it('keeps F5 from reloading the page mid-presentation', () => {
        render(<GroupGraph teams={teams()} />);
        const event = createEvent.keyDown(window, { key: 'F5' });

        fireEvent(window, event);

        expect(event.defaultPrevented).toBe(true);
        expect(labels()).toEqual(['1. Platz', '2. Platz', '3. Platz', '4. Platz']);
    });

    it('stops listening for keys when it is removed', () => {
        const { unmount } = render(<GroupGraph teams={teams()} />);
        unmount();
        const event = createEvent.keyDown(window, { key: 'F5' });

        fireEvent(window, event);

        expect(event.defaultPrevented).toBe(false);
    });

    it('draws a placeholder instead of the character until a team is revealed', async () => {
        loadImagesInstantly();
        render(<GroupGraph teams={teams()} />);

        await waitFor(() => {
            chartContext.drawImage.mockClear();
            completeChartAnimation();
            expect(drawnImages()).toEqual(['missingno.png', 'missingno.png', 'missingno.png', 'missingno.png']);
        });

        pressKey('ArrowRight');
        chartContext.drawImage.mockClear();
        completeChartAnimation();
        expect(drawnImages()).toEqual(['missingno.png', 'missingno.png', 'Mario.png', 'Toad.png']);
    });

    it('writes every score into its bar', async () => {
        render(<GroupGraph teams={teams()} />);

        completeChartAnimation();

        expect(writtenTexts().map(call => call[0])).toEqual(['30', '20', '10', '10']);
    });

    it('leaves 20% headroom above the best score', () => {
        render(<GroupGraph teams={teams()} />);

        expect(yAxis().max).toBe(36);
        expect(tickLabel(36)).toBeNull();
        expect(tickLabel(18)).toBe(18);
    });

    it('renders an empty chart without teams', () => {
        render(<GroupGraph teams={[]} />);

        expect(labels()).toEqual([]);
    });

    it.todo('renders a ranking with a single team (currently throws while comparing it with a second place)');
});

describe('FinalGraph', () => {
    const teams = () => [team(1, 'Mario', 0, 10), team(2, 'Luigi', 0, 30), team(3, 'Peach', 0, 20), team(4, 'Toad', 0, 5)];

    /** Makes the Fisher-Yates shuffle leave the order untouched: bars appear best team first. */
    const keepOrder = () => vi.spyOn(Math, 'random').mockReturnValue(0.999);

    it('starts with empty bars in the neutral colour', () => {
        keepOrder();

        render(<FinalGraph teams={teams()} />);

        expect(labels()).toEqual(['Team Luigi', 'Team Peach', 'Team Mario', 'Team Toad']);
        expect(data()).toEqual([0, 0, 0, 0]);
        expect(colors()).toEqual([HIDDEN, HIDDEN, HIDDEN, HIDDEN]);
    });

    it('shuffles the bars so their order does not give the ranking away', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        render(<FinalGraph teams={teams()} />);

        expect(labels()).toEqual(['Team Peach', 'Team Mario', 'Team Toad', 'Team Luigi']);
    });

    it('keeps scores and colours attached to their team after shuffling', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        render(<FinalGraph teams={teams()} />);

        pressTimes(9);

        expect(labels()).toEqual(['Team Peach', 'Team Mario', 'Team Toad', 'Team Luigi']);
        expect(data()).toEqual([20, 10, 5, 30]);
        expect(colors()).toEqual([SILVER, BRONZE, GREY, GOLD]);
    });

    it('raises all bars to the lowest score first, then marks the last place', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressKey('ArrowRight');
        expect(data()).toEqual([5, 5, 5, 5]);
        expect(colors()).toEqual([HIDDEN, HIDDEN, HIDDEN, HIDDEN]);

        pressKey('ArrowRight');
        expect(colors()).toEqual([HIDDEN, HIDDEN, HIDDEN, GREY]);
    });

    it('works its way up place by place, alternating between raising bars and awarding medals', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressTimes(3);
        expect(data()).toEqual([10, 10, 10, 5]);

        pressKey('ArrowRight');
        expect(colors()).toEqual([HIDDEN, HIDDEN, BRONZE, GREY]);

        pressKey('ArrowRight');
        expect(data()).toEqual([20, 20, 10, 5]);

        pressKey('ArrowRight');
        expect(colors()).toEqual([HIDDEN, SILVER, BRONZE, GREY]);
    });

    it('crowns a sole winner in the same step that raises its bar', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressTimes(7);

        expect(data()).toEqual([30, 20, 10, 5]);
        expect(colors()).toEqual([GOLD, SILVER, BRONZE, GREY]);
    });

    it('stays on the final picture when the presentation is advanced further', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressTimes(20);

        expect(data()).toEqual([30, 20, 10, 5]);
        expect(colors()).toEqual([GOLD, SILVER, BRONZE, GREY]);
    });

    it('gives tied winners the same medal and skips the place they share', () => {
        keepOrder();
        render(<FinalGraph teams={[team(1, 'Mario', 0, 10), team(2, 'Luigi', 0, 30), team(3, 'Peach', 0, 30)]} />);

        pressTimes(3);
        expect(data()).toEqual([30, 30, 10]);
        expect(colors()).toEqual([HIDDEN, HIDDEN, BRONZE]);

        pressKey('ArrowRight');
        expect(colors()).toEqual([GOLD, GOLD, BRONZE]);
    });

    it.each([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'PageDown', 'PageUp'])('advances with the "%s" key', (key) => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressKey(key);

        expect(data()).toEqual([5, 5, 5, 5]);
    });

    it('ignores other keys', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        pressKey('a');

        expect(data()).toEqual([0, 0, 0, 0]);
    });

    it('keeps F5 from reloading the page mid-presentation', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);
        const event = createEvent.keyDown(window, { key: 'F5' });

        fireEvent(window, event);

        expect(event.defaultPrevented).toBe(true);
    });

    it('leaves 20% headroom above the best score', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);

        expect(yAxis().max).toBe(36);
        expect(tickLabel(36)).toBeNull();
        expect(tickLabel(30)).toBe(30);
    });

    it('draws the characters but no scores while the bars are empty', async () => {
        keepOrder();
        loadImagesInstantly();
        render(<FinalGraph teams={teams()} />);
        await waitFor(() => {
            chartContext.drawImage.mockClear();
            completeChartAnimation();
            expect(drawnImages()).toEqual(['Luigi.png', 'Peach.png', 'Mario.png', 'Toad.png']);
        });

        expect(writtenTexts()).toEqual([]);
    });

    it('writes the revealed scores into the bars', async () => {
        keepOrder();
        loadImagesInstantly();
        render(<FinalGraph teams={teams()} />);
        pressTimes(9);

        await waitFor(() => {
            chartContext.fillText.mockClear();
            completeChartAnimation();
            expect(writtenTexts().map(call => call[0])).toEqual(['30', '20', '10', '5']);
        });
    });

    it('draws nothing until the characters have loaded', () => {
        keepOrder();
        render(<FinalGraph teams={teams()} />);
        pressTimes(9);

        completeChartAnimation();

        expect(chartContext.drawImage).not.toHaveBeenCalled();
        expect(writtenTexts()).toEqual([]);
    });

    it.todo('renders a ranking with a single team (currently throws while comparing it with a second place)');
});

describe('QuestionGraph', () => {
    const question = (overrides: Partial<QuestionReturnDTO> = {}) => makeQuestion({ options: ['Mario', 'Luigi', 'Peach'], ...overrides });

    it('charts the votes per option', () => {
        render(<QuestionGraph question={question()} answers={[4, 0, 2]} />);

        expect(labels()).toEqual(['Mario', 'Luigi', 'Peach']);
        expect(data()).toEqual([4, 0, 2]);
    });

    it('counts options without statistics as 0 votes', () => {
        render(<QuestionGraph question={question()} answers={[4]} />);

        expect(data()).toEqual([4, 0, 0]);
    });

    it('updates when the statistics arrive', () => {
        const { rerender } = render(<QuestionGraph question={question()} answers={[]} />);
        expect(data()).toEqual([0, 0, 0]);

        rerender(<QuestionGraph question={question()} answers={[1, 2, 3]} />);

        expect(data()).toEqual([1, 2, 3]);
    });

    it('leaves 20% headroom above the most popular option', () => {
        render(<QuestionGraph question={question()} answers={[10, 0, 5]} />);

        expect(yAxis().max).toBe(12);
        expect(tickLabel(12)).toBeNull();
        expect(tickLabel(10)).toBe(10);
        expect(tickLabel('7.5')).toBe(7.5);
    });

    it('writes the number of votes into every bar that has votes', () => {
        render(<QuestionGraph question={question()} answers={[4, 0, 2]} />);
        chartContext.fillText.mockClear();

        completeChartAnimation();

        expect(writtenTexts()).toEqual([
            ['4', barPosition(0).x, barPosition(0).y + 30],
            ['2', barPosition(2).x, barPosition(2).y + 30],
        ]);
    });

    it('renders an empty chart for a question without options', () => {
        render(<QuestionGraph question={question({ options: undefined as unknown as string[] })} answers={[]} />);

        expect(labels()).toEqual([]);
        expect(data()).toEqual([]);
    });
});
