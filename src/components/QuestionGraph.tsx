import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../util/api/config/interfaces";
import './RankingGraph.css';

Chart.register(...registerables);

const StaticFinalGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>();

    // Memoize sortierte Teams und Daten
    const sortedTeamsData = React.useMemo(() => {
        const sorted = [...teams].sort((a, b) => b.finalPoints - a.finalPoints);

        // Neue Ranks-Berechnung
        const ranks: number[] = [];
        sorted.forEach((team, index) => {
            if (index === 0) {
                ranks[index] = 1;
            } else if (sorted[index - 1].finalPoints === team.finalPoints) {
                ranks[index] = ranks[index - 1];
            } else {
                ranks[index] = index + 1;
            }
        });

        return {
            teams: sorted,
            finalData: sorted.map(team => team.finalPoints),
            icons: sorted.map(team => `/characters/${team.character.characterName}.png`),
            labels: sorted.map(team => team.teamName),
            ranks: ranks
        };
    }, [teams]);

    const chartData = React.useMemo(() => ({
        labels: sortedTeamsData.labels,
        datasets: [{
            label: "Ranking",
            data: sortedTeamsData.finalData,
            backgroundColor: '#6351F9',
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 10,
            borderSkipped: false,
        }],
    }), [sortedTeamsData]);

    const drawImages = React.useCallback((chart: ChartJS<"bar">, ctx: CanvasRenderingContext2D) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data) return;

        meta.data.forEach((bar, index) => {
            const score = sortedTeamsData.finalData[index];
            if (score > 0) {
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.font = '800 20px Poppins';
                ctx.textAlign = 'center';
                const textY = bar.y + 30;
                ctx.fillText(score.toString(), bar.x, textY);
                ctx.restore();
            }
        });
    }, [sortedTeamsData.finalData]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.canvas.getContext('2d');
        if (!ctx) return;

        drawImages(chart, ctx);
    }, [drawImages]);

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
                drawImages(chart, ctx);
            },
            onComplete: function () {
                const chart = chartRef.current;
                if (!chart) return;
                const ctx = chart.canvas.getContext('2d');
                if (!ctx) return;
                drawImages(chart, ctx);
            }
        },
        scales: {
            y: {
                display: true,
                beginAtZero: true,
                max: Math.max(...sortedTeamsData.finalData) + Math.max(...sortedTeamsData.finalData) * 0.2,
                ticks: {
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        weight: 800
                    },
                    callback: function (tickValue: number | string) {
                        const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                        const max = Math.max(...sortedTeamsData.finalData) + Math.max(...sortedTeamsData.finalData) * 0.2;
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
    }), [sortedTeamsData.finalData, drawImages]);

    return (
        <div className="ranking-container">
            <div style={{ height: "400px" }}>
                <Bar ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StaticFinalGraph;
