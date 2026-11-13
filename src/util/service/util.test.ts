import { convertUmlauts } from './util';

describe('convertUmlauts', () => {
    it.each([
        ['Grün', 'Gruen'],
        ['Weiß', 'Weiss'],
        ['Äpfel Öl Übung', 'Aepfel Oel Uebung'],
        ['ä ö ü', 'ae oe ue'],
        ['GROẞ', 'GROSS'],
    ])('converts "%s" to "%s"', (input, expected) => {
        expect(convertUmlauts(input)).toBe(expected);
    });

    it('leaves text without umlauts untouched', () => {
        expect(convertUmlauts('Rot Blau 123 -_!')).toBe('Rot Blau 123 -_!');
    });

    it('returns an empty string for an empty string', () => {
        expect(convertUmlauts('')).toBe('');
    });
});
