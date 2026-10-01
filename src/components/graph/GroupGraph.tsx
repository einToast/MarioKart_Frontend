import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../../util/api/config/interfaces";
import { loadImage } from "../../util/service/util";
import './RankingGraph.css';

Chart.register(...registerables);

const GroupGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>(null);
    const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
    const [revealedIcons, setRevealedIcons] = useState<string[]>([]);
    const [revealedLabels, setRevealedLabels] = useState<string[]>([]);
    const [step, setStep] = useState(0);


    const sortedTeamsData = React.useMemo(() => {
        const sorted = [...teams].sort((a, b) => b.groupPoints - a.groupPoints);

        const pointGroups: number[][] = [];
        let currentGroup: number[] = [0];
        let currentRank = 1;
        const ranks: number[] = new Array(sorted.length).fill(0);
        ranks[0] = currentRank;

        sorted.forEach((team, index) => {
            if (index === 0) return;
            if (team.groupPoints === sorted[currentGroup[0]].groupPoints) {
                currentGroup.push(index);
                ranks[index] = currentRank;
            } else {
                pointGroups.push(currentGroup);
                currentGroup = [index];
                currentRank = index + 1;
                ranks[index] = currentRank;
            }
        });
        pointGroups.push(currentGroup);

        const isFirstPlaceAlone = sorted.length === 0 || sorted[1].groupPoints < sorted[0].groupPoints;

        return {
            teams: sorted,
            initialData: new Array(sorted.length).fill(0),
            finalData: sorted.map(team => team.groupPoints),
            icons: sorted.map(team => `/characters/${team.character.characterName}.png`),
            labels: sorted.map(team => team.teamName),
            pointGroups: [[0], ...pointGroups],
            ranks: ranks,
            isFirstPlaceAlone
        };
    }, [teams]);

    useEffect(() => {
        setRevealedIcons(new Array(sortedTeamsData.teams.length).fill('/media/missingno.png'));
        setRevealedLabels(new Array(sortedTeamsData.teams.length).fill('').map((_, i) => `${i + 1}. Platz`));
        setStep(0);
    }, [sortedTeamsData]);

    useEffect(() => {
        Promise.all([...sortedTeamsData.icons, '/media/missingno.png'].map(loadImage))
            .then(setLoadedImages)
            .catch(error => console.error('Error preloading images:', error));
    }, [sortedTeamsData.icons]);

    const revealNext = React.useCallback(() => {
        const totalGroups = sortedTeamsData.pointGroups.length;
        const maxSteps = totalGroups;

        if (step < maxSteps) {
            const currentGroupIndex = totalGroups - 1 - step;
            const currentGroup = sortedTeamsData.pointGroups[currentGroupIndex];

            setRevealedIcons(prev => {
                const newIcons = [...prev];
                currentGroup.forEach(teamIndex => {
                    newIcons[teamIndex] = sortedTeamsData.icons[teamIndex];
                });
                return newIcons;
            });
            setRevealedLabels(prev => {
                const newLabels = [...prev];
                currentGroup.forEach(teamIndex => {
                    newLabels[teamIndex] = sortedTeamsData.labels[teamIndex];
                });
                return newLabels;
            });

            setStep(s => s + 1);
        }
    }, [step, sortedTeamsData]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const validKeys = new Set([" ", "Enter", "ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "PageDown", "PageUp"]);
            if (validKeys.has(event.key)) {
                event.preventDefault();
                revealNext();
            } else if (event.key === "F5") {
                event.preventDefault();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);

    }, [revealNext]);

    const chartData = React.useMemo(() => ({
        labels: revealedLabels,
        datasets: [{
            label: "Ranking",
            data: sortedTeamsData.finalData,
            backgroundColor: '#6351F9',
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 10,
            borderSkipped: false,
        }],
    }), [revealedLabels, sortedTeamsData.finalData]);

    const drawImages = React.useCallback((chart: ChartJS<"bar">, ctx: CanvasRenderingContext2D) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data) return;

        const chartArea = chart.chartArea;
        ctx.save();
        ctx.clearRect(chartArea.left, 0, chartArea.right - chartArea.left, chartArea.top);

        meta.data.forEach((bar, index) => {
            const iconPath = revealedIcons[index];
            if (!iconPath) return;

            const iconName = decodeURIComponent(iconPath.split('/').pop() || '');
            const img = loadedImages.find(img => decodeURIComponent(img.src).includes(iconName));

            if (img) {
                const x = bar.x;
                const y = bar.y - 40;
                ctx.drawImage(img, x - 20, y, 40, 40);
            }

            const score = Math.round(sortedTeamsData.finalData[index]);
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
        ctx.restore();
    }, [loadedImages, revealedIcons, sortedTeamsData.finalData]);

    const options: ChartOptions<"bar"> = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500,
            easing: "easeInOutCubic" as const,
            onProgress: function (animation) {
                const chart = chartRef.current;
                if (!chart) return;
                const ctx = chart.canvas.getContext('2d');
                if (!ctx) return;
                drawImages(chart, ctx);
            },
            onComplete: function (animation) {
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
                        const value = typeof tickValue === 'string' ? Number.parseFloat(tickValue) : tickValue;
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

export default GroupGraph;