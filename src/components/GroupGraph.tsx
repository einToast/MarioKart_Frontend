import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../util/api/config/interfaces";
import './RankingGraph.css';

Chart.register(...registerables);

const GroupGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>();
    const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
    const [revealedIcons, setRevealedIcons] = useState<string[]>([]);
    const [revealedLabels, setRevealedLabels] = useState<string[]>([]);
    const [revealedColors, setRevealedColors] = useState<string[]>([]);
    const [step, setStep] = useState(0);

    // Fisher-Yates Shuffle Algorithmus entfernen
    // const shuffleArray = React.useCallback((array: number[]) => {
    //     const newArray = [...array];
    //     for (let i = newArray.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    //     }
    //     return newArray;
    // }, []);

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

    // Initialisierung
    useEffect(() => {
        // Initialisiere alle Icons mit missingno
        setRevealedIcons(Array(sortedTeamsData.teams.length).fill('/media/missingno.png'));
        // Initialisiere Labels mit Platzierungen
        setRevealedLabels(Array(sortedTeamsData.teams.length).fill('').map((_, i) => `${i + 1}. Platz`));
        setRevealedColors(Array(sortedTeamsData.teams.length).fill('#6351F9'));
        setStep(0);
    }, [sortedTeamsData]);

    // Bilder vorladen
    useEffect(() => {
        const preloadImages = async () => {
            const missingno = new Image();
            missingno.src = '/media/missingno.png';
            const loadImages = [...sortedTeamsData.icons.map((src) => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(img);
                });
            }), new Promise<HTMLImageElement>((resolve) => {
                missingno.onload = () => resolve(missingno);
            })];
            const images = await Promise.all(loadImages);
            setLoadedImages(images);
        };
        preloadImages();
    }, [sortedTeamsData.icons]);

    const colors = React.useMemo(() => ["#FFD700", "#C0C0C0", "#CD7F32", "#696969"], []);

    // Optimierte revealNext Funktion
    const revealNext = React.useCallback(() => {
        const totalGroups = sortedTeamsData.pointGroups.length;
        const maxSteps = totalGroups;

        if (step < maxSteps) {
            const currentGroupIndex = totalGroups - 1 - step;
            const currentGroup = sortedTeamsData.pointGroups[currentGroupIndex];

            // Icons und Namen enthüllen
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

    // Angepasstes chartData
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

    // Angepasstes drawImages
    const drawImages = React.useCallback((chart: ChartJS<"bar">, ctx: CanvasRenderingContext2D) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data) return;

        const chartArea = chart.chartArea;
        ctx.save();
        ctx.clearRect(chartArea.left, 0, chartArea.right - chartArea.left, chartArea.top);

        meta.data.forEach((bar, index) => {
            const iconPath = revealedIcons[index];
            const iconName = decodeURIComponent(iconPath?.split('/')?.pop() || '');
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

export default GroupGraph;