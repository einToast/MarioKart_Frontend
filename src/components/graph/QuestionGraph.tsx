import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { QuestionGraphProps } from "../../util/api/config/interfaces";
import './RankingGraph.css';

Chart.register(...registerables);

const QuestionGraph: React.FC<QuestionGraphProps> = ({ question, answers }) => {
    const chartRef = useRef<ChartJS<"bar">>(null);

    // Memoize die Antwortdaten
    const answerData = React.useMemo(() => {
        const options = question.options || [];
        const data = options.map((option, index) => ({
            optionText: option,
            count: answers[index] || 0
        }));
        return {
            labels: data.map(item => item.optionText),
            counts: data.map(item => item.count)
        };
    }, [question, answers]);

    const chartData = React.useMemo(() => ({
        labels: answerData.labels,
        datasets: [{
            label: "Antworten",
            data: answerData.counts,
            backgroundColor: '#6351F9',
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 10,
            borderSkipped: false,
        }],
    }), [answerData]);

    const drawCounts = React.useCallback((chart: ChartJS<"bar">, ctx: CanvasRenderingContext2D) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data) return;

        meta.data.forEach((bar, index) => {
            const count = answerData.counts[index];
            if (count > 0) {
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.font = '800 20px Poppins';
                ctx.textAlign = 'center';
                const textY = bar.y + 30;
                ctx.fillText(count.toString(), bar.x, textY);
                ctx.restore();
            }
        });
    }, [answerData.counts]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.canvas.getContext('2d');
        if (!ctx) return;

        drawCounts(chart, ctx);
    }, [drawCounts]);

    const options: ChartOptions<"bar"> = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0,
            onProgress: function () {
                const chart = chartRef.current;
                if (!chart) return;
                const ctx = chart.canvas.getContext('2d');
                if (!ctx) return;
                drawCounts(chart, ctx);
            },
            onComplete: function () {
                const chart = chartRef.current;
                if (!chart) return;
                const ctx = chart.canvas.getContext('2d');
                if (!ctx) return;
                drawCounts(chart, ctx);
            }
        },
        scales: {
            y: {
                display: true,
                beginAtZero: true,
                max: Math.max(...answerData.counts) + Math.max(...answerData.counts) * 0.2,
                ticks: {
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        weight: 800
                    },
                    callback: function (tickValue: number | string) {
                        const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                        const max = Math.max(...answerData.counts) + Math.max(...answerData.counts) * 0.2;
                        if (value >= max) return null;
                        return value;
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                },
                ticks: {
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        weight: 800,
                        size: 16
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        }
    }), [answerData.counts, drawCounts]);

    return (
        <div className="ranking-container">
            <div style={{ height: "400px" }}>
                <Bar ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
};

export default QuestionGraph;
