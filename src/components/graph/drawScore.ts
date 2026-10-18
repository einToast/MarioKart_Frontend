export const drawScore = (ctx: CanvasRenderingContext2D, score: number, x: number, y: number): void => {
    const text = score.toString();
    ctx.save();
    ctx.font = '800 20px Poppins';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10112E';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
};
