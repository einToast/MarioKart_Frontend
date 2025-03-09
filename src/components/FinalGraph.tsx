import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../util/api/config/interfaces";
import './RankingGraph.css';

Chart.register(...registerables);

const FinalGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>();
    const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
    const [data, setData] = useState<number[]>([]);
    const [revealedColors, setRevealedColors] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [displayOrder, setDisplayOrder] = useState<number[]>([]);

    // Fisher-Yates Shuffle Algorithmus
    const shuffleArray = React.useCallback((array: number[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    // Memoize sortierte Teams und abgeleitete Daten
    const sortedTeamsData = React.useMemo(() => {
        const sorted = [...teams].sort((a, b) => b.finalPoints - a.finalPoints);

        // Gruppiere Teams nach Punktzahl und bestimme ihre Platzierung
        const pointGroups: number[][] = [];
        let currentGroup: number[] = [0];
        let currentRank = 1;
        const ranks: number[] = Array(sorted.length).fill(0);
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

        // Überprüfe, ob der erste Platz alleine ist
        const isFirstPlaceAlone = sorted.length === 0 || sorted[1].finalPoints < sorted[0].finalPoints;

        return {
            teams: sorted,
            initialData: Array(sorted.length).fill(0),
            finalData: sorted.map(team => team.finalPoints),
            icons: sorted.map(team => `/characters/${team.character?.characterName}.png`),
            labels: sorted.map(team => team.teamName),
            pointGroups: [[0], ...pointGroups],
            ranks: ranks,
            isFirstPlaceAlone
        };
    }, [teams]);

    // Initialisierung mit zufälliger Reihenfolge
    useEffect(() => {
        const indices = Array.from({ length: sortedTeamsData.teams.length }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);
        setDisplayOrder(shuffledIndices);
        setData(sortedTeamsData.initialData);
        setRevealedColors(Array(sortedTeamsData.teams.length).fill('#6351F9'));
        setStep(0);
    }, [sortedTeamsData, shuffleArray]);

    // Bilder vorladen
    useEffect(() => {
        const preloadImages = async () => {
            const loadImages = sortedTeamsData.icons.map((src) => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(img);
                });
            });
            const images = await Promise.all(loadImages);
            setLoadedImages(images);
        };
        preloadImages();
    }, [sortedTeamsData.icons]);

    const colors = React.useMemo(() => ["#FFD700", "#C0C0C0", "#CD7F32", "#696969"], []);

    // Optimierte revealNext Funktion
    const revealNext = React.useCallback(() => {
        const totalGroups = sortedTeamsData.pointGroups.length;
        const maxSteps = (totalGroups - 1) * 2 + 1;

        if (step < maxSteps) {
            const currentGroupIndex = totalGroups - 1 - Math.floor(step / 2);
            const isColorStep = step % 2 === 1;
            const currentGroup = sortedTeamsData.pointGroups[currentGroupIndex];

            if (currentGroupIndex === 0) {
                // Erste Gruppe (Gold)
                setData(prev => {
                    const newData = [...prev];
                    currentGroup.forEach(teamIndex => {
                        newData[teamIndex] = sortedTeamsData.finalData[teamIndex];
                    });
                    return newData;
                });
            } else {
                if (!isColorStep) {
                    // Alle Balken der aktuellen Gruppe auf das nächste Level bringen
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
                    // Wenn der erste alleine ist, direkt die Farbe setzen
                    if (sortedTeamsData.isFirstPlaceAlone && step === maxSteps - 3) {
                        setRevealedColors(prev => {
                            const newColors = [...prev];
                            currentGroup.forEach(teamIndex => {
                                newColors[teamIndex] = colors[0]; // Gold
                            });
                            return newColors;
                        });
                    }
                } else {
                    // Farbe der aktuellen Gruppe ändern
                    setRevealedColors(prev => {
                        const newColors = [...prev];
                        currentGroup.forEach(teamIndex => {
                            const rank = sortedTeamsData.ranks[teamIndex];
                            if (rank <= 3) {
                                // Erste drei Plätze bekommen Medaillenfarben
                                newColors[teamIndex] = colors[rank - 1];
                            } else {
                                // Alle anderen bekommen grau
                                newColors[teamIndex] = colors[3];
                            }
                        });
                        return newColors;
                    });
                }
            }
            setStep(s => s + 1);
        }
    }, [step, colors, sortedTeamsData]);

    // Event-Listener für Tastendruck
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight") {
                revealNext();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [revealNext]);

    // Memoize Chart Data mit geshuffelter Reihenfolge
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
            const iconName = decodeURIComponent(iconPath?.split('/')?.pop() || '');
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

    // Memoize Chart Options
    const options: ChartOptions<"bar"> = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500, // Reduzierte Animationsdauer
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

export default FinalGraph;
