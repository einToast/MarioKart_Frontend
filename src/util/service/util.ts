export const convertUmlauts = (text: string): string => {
    const umlautMap: Record<string, string> = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'Ä': 'Ae',
        'Ö': 'Oe',
        'Ü': 'Ue',
        'ß': 'ss',
        'ẞ': 'SS'
    };

    return text.split('').map(char => umlautMap[char] || char).join('');
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}
