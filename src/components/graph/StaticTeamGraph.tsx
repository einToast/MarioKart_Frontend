import { Chart, Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { TeamGraphProps } from "../../util/api/config/interfaces";
import { loadImage } from "../../util/service/util";
import './RankingGraph.css';

Chart.register(...registerables);

const StaticTeamGraph: React.FC<TeamGraphProps> = ({ teams }) => {
    const chartRef = useRef<ChartJS<"bar">>(null);
    const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const sortedTeamsData = React.useMemo(() => {
        const sorted = [...teams].sort((a, b) => b.groupPoints - a.groupPoints);

        const ranks: number[] = [];
        sorted.forEach((team, index) => {
            if (index === 0) {
                ranks[index] = 1;
            } else if (sorted[index - 1].groupPoints === team.groupPoints) {
                ranks[index] = ranks[index - 1];
            } else {
                ranks[index] = index + 1;
            }
        });

        return {
            teams: sorted,
            finalData: sorted.map(team => team.groupPoints),
            icons: sorted.map(team => `/characters/${team.character.characterName}.png`),
            labels: sorted.map(team => team.teamName),
            ranks: ranks
        };
    }, [teams]);

    useEffect(() => {
        Promise.all(sortedTeamsData.icons.map(loadImage))
            .then(setLoadedImages)
            .catch(error => console.error('Error preloading images:', error));
    }, [sortedTeamsData.icons]);

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

        const chartArea = chart.chartArea;
        ctx.save();
        ctx.clearRect(chartArea.left, 0, chartArea.right - chartArea.left, chartArea.top);

        const isMobile = window.innerWidth < 768;

        meta.data.forEach((bar, index) => {
            // Icon zeichnen
            const iconPath = sortedTeamsData.icons[index];
            if (!iconPath) return;
            const iconName = decodeURIComponent(iconPath.split('/').pop() || '');
            const img = loadedImages.find(img => decodeURIComponent(img.src).includes(iconName));
            if (img) {
                const x = bar.x;
                const y = bar.y - (isMobile ? 20 : 40);
                const size = isMobile ? 30 : 40;
                ctx.drawImage(img, x - size / 2, y, size, size);
            }

            // Punktzahl nur auf Desktop anzeigen
            if (!isMobile) {
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
            }
        });
        ctx.restore();
    }, [loadedImages, sortedTeamsData.icons, sortedTeamsData.finalData]);

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
                    display: !isMobile,
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
                    display: !isMobile,
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
    }), [sortedTeamsData.finalData, drawImages, isMobile]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (chartRef.current) {
                chartRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="ranking-container">
            <div style={{ height: "400px" }}>
                <Bar ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StaticTeamGraph;
