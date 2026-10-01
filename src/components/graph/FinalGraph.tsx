import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../../util/api/config/interfaces";
import { loadImage } from "../../util/service/util";
import './RankingGraph.css';

Chart.register(...registerables);

const FinalGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>(null);
    const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
    const [data, setData] = useState<number[]>([]);
    const [revealedColors, setRevealedColors] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [displayOrder, setDisplayOrder] = useState<number[]>([]);

    const shuffleArray = React.useCallback((array: number[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    const sortedTeamsData = React.useMemo(() => {
        const sorted = [...teams].sort((a, b) => b.finalPoints - a.finalPoints);

        const pointGroups: number[][] = [];
        let currentGroup: number[] = [0];
        let currentRank = 1;
        const ranks: number[] = new Array(sorted.length).fill(0);
        ranks[0] = currentRank;

        sorted.forEach((team, index) => {
            if (index === 0) return;
            if (team.finalPoints === sorted[currentGroup[0]].finalPoints) {
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

        const isFirstPlaceAlone = sorted.length === 0 || sorted[1].finalPoints < sorted[0].finalPoints;

        return {
            teams: sorted,
            initialData: new Array(sorted.length).fill(0),
            finalData: sorted.map(team => team.finalPoints),
            icons: sorted.map(team => `/characters/${team.character.characterName}.png`),
            labels: sorted.map(team => team.teamName),
            pointGroups: [[0], ...pointGroups],
            ranks: ranks,
            isFirstPlaceAlone
        };
    }, [teams]);

    useEffect(() => {
        const indices = Array.from({ length: sortedTeamsData.teams.length }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);
        setDisplayOrder(shuffledIndices);
        setData(sortedTeamsData.initialData);
        setRevealedColors(new Array(sortedTeamsData.teams.length).fill('#6351F9'));
        setStep(0);
    }, [sortedTeamsData, shuffleArray]);

    useEffect(() => {
        Promise.all(sortedTeamsData.icons.map(loadImage))
            .then(setLoadedImages)
            .catch(error => console.error('Error preloading images:', error));
    }, [sortedTeamsData.icons]);

    const colors = React.useMemo(() => ["#FFD700", "#C0C0C0", "#CD7F32", "#696969"], []);

    const revealNext = React.useCallback(() => {
        const totalGroups = sortedTeamsData.pointGroups.length;
        const maxSteps = (totalGroups - 1) * 2 + 1;

        if (step < maxSteps) {
            const currentGroupIndex = totalGroups - 1 - Math.floor(step / 2);
            const isColorStep = step % 2 === 1;
            const currentGroup = sortedTeamsData.pointGroups[currentGroupIndex];

            if (currentGroupIndex === 0) {
                setData(prev => {
                    const newData = [...prev];
                    currentGroup.forEach(teamIndex => {
                        newData[teamIndex] = sortedTeamsData.finalData[teamIndex];
                    });
                    return newData;
                });
            } else if (isColorStep) {
                setRevealedColors(prev => {
                    const newColors = [...prev];
                    currentGroup.forEach(teamIndex => {
                        const rank = sortedTeamsData.ranks[teamIndex];
                        if (rank <= 3) {
                            newColors[teamIndex] = colors[rank - 1];
                        } else {
                            newColors[teamIndex] = colors[3];
                        }
                    });
                    return newColors;
                });
            } else {
                const nextHeight = sortedTeamsData.finalData[currentGroup[0]];
                setData(prev => {
                    const newData = [...prev];
                    currentGroup.forEach(teamIndex => {
                        newData[teamIndex] = nextHeight;
                    });
                    for (let i = currentGroupIndex - 1; i >= 0; i--) {
                        sortedTeamsData.pointGroups[i].forEach(teamIndex => {
                            newData[teamIndex] = nextHeight;
                        });
                    }
                    return newData;
                });
                if (sortedTeamsData.isFirstPlaceAlone && step === maxSteps - 3) {
                    setRevealedColors(prev => {
                        const newColors = [...prev];
                        currentGroup.forEach(teamIndex => {
                            newColors[teamIndex] = colors[0]; // Gold
                        });
                        return newColors;
                    });
                }
            }
            setStep(s => s + 1);
        }
    }, [step, colors, sortedTeamsData]);

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
        labels: displayOrder.map(i => sortedTeamsData.labels[i]),
        datasets: [{
            label: "Ranking",
            data: displayOrder.map(i => data[i]),
            backgroundColor: displayOrder.map(i => revealedColors[i]),
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 10,
            borderSkipped: false,
        }],
    }), [data, revealedColors, sortedTeamsData.labels, displayOrder]);

    const drawImages = React.useCallback((chart: ChartJS<"bar">, ctx: CanvasRenderingContext2D) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || loadedImages.length === 0) return;

        const chartArea = chart.chartArea;
        ctx.save();
        ctx.clearRect(chartArea.left, 0, chartArea.right - chartArea.left, chartArea.top);

        meta.data.forEach((bar, index) => {
            const originalIndex = displayOrder[index];
            const iconPath = sortedTeamsData.icons[originalIndex];
            if (!iconPath) return;
            const iconName = decodeURIComponent(iconPath.split('/').pop() || '');
            const img = loadedImages.find(img => decodeURIComponent(img.src).includes(iconName));

            if (img) {
                const x = bar.x;
                const y = bar.y - 40;
                ctx.drawImage(img, x - 20, y, 40, 40);
            }

            const score = Math.round(data[originalIndex]);
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
    }, [loadedImages, data, displayOrder, sortedTeamsData.icons]);

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

export default FinalGraph;
