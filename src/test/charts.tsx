import type { ChartData, ChartOptions } from 'chart.js';
import React, { forwardRef, useImperativeHandle } from 'react';
import { vi } from 'vitest';

interface BarProps {
    data: ChartData<'bar'>;
    options: ChartOptions<'bar'>;
}

/** Records what the graphs draw onto the canvas, which jsdom cannot render. */
export const chartContext = {
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
};

const barRenders: BarProps[] = [];

/** Bars are laid out 100px apart at a fixed height so drawing coordinates are predictable. */
export const barPosition = (index: number): { x: number; y: number } => ({ x: 100 * (index + 1), y: 200 });

export const fakeChart = {
    canvas: { getContext: vi.fn(() => chartContext) },
    chartArea: { left: 10, right: 510, top: 50, bottom: 400 },
    getDatasetMeta: vi.fn(() => ({
        data: (lastBarProps().data.labels ?? []).map((_, index) => barPosition(index)),
    })),
    update: vi.fn(),
};

/**
 * Replacement for the react-chartjs-2 Bar (wired up in setupTests.ts). It captures the props of
 * every render and hands the component a fake chart instance through its ref.
 */
export const Bar = forwardRef<unknown, BarProps>((props, ref) => {
    useImperativeHandle(ref, () => fakeChart);
    barRenders.push(props);
    return <canvas data-testid="bar-chart" />;
});
Bar.displayName = 'FakeBar';

export const lastBarProps = (): BarProps => {
    const props = barRenders[barRenders.length - 1];
    if (!props) {
        throw new Error('No Bar chart has been rendered');
    }
    return props;
};

/** Runs the chart's animation-complete hook, which is where the graphs paint icons and scores. */
export const completeChartAnimation = (): void => {
    const animation = lastBarProps().options.animation;
    if (animation && typeof animation.onComplete === 'function') {
        (animation.onComplete as () => void)();
    }
};

export const resetCharts = (): void => {
    barRenders.length = 0;
};
