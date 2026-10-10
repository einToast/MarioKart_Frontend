import { DEFAULT_PROGRAM, defaultProgram, parseProgram, PROGRAM_ICONS, resolveProgram, serializeProgram } from './program';

describe('programme', () => {
    it('has the classic schedule of the day as default', () => {
        expect(DEFAULT_PROGRAM.map(entry => `${entry.time} ${entry.text}`)).toEqual([
            '16:00 - 16:45 Arne labert',
            '16:45 - 18:30 Runde 1 - 5',
            '18:30 - 19:00 Pause',
            '19:00 - 20:00 Runde 6 - 8',
            '20:00 - 20:45 Finale',
            '21:00 Siegerehrung',
        ]);
        DEFAULT_PROGRAM.forEach(entry => expect(PROGRAM_ICONS[entry.icon]).toBeDefined());
    });

    it('hands out an own copy of the default', () => {
        defaultProgram()[0].text = 'geändert';

        expect(defaultProgram()[0].text).toBe('Arne labert');
    });

    it('survives a round trip', () => {
        const entries = [{ icon: 'trophy' as const, time: '21:00', text: 'Pokal' }];

        expect(parseProgram(serializeProgram(entries))).toEqual(entries);
        expect(parseProgram(serializeProgram([]))).toEqual([]);
    });

    it.each([[null], [undefined], [''], ['not json'], ['[]'], ['{"entries":"none"}'], ['null']])('returns null for %s', (json) => {
        expect(parseProgram(json)).toBeNull();
    });

    it('drops broken entries and repairs incomplete ones', () => {
        const parsed = parseProgram(JSON.stringify({
            entries: [
                null,
                { icon: 'play', time: 5, text: 'x' },
                { icon: 'rocket', time: '9:00', text: 'Start' },
                { time: 't'.repeat(50), text: 'y'.repeat(100) },
            ],
        }));

        expect(parsed).toHaveLength(2);
        expect(parsed?.[0]).toEqual({ icon: 'time', time: '9:00', text: 'Start' });
        expect(parsed?.[1].time).toHaveLength(20);
        expect(parsed?.[1].text).toHaveLength(60);
    });

    it('keeps at most thirty entries', () => {
        const entries = Array.from({ length: 40 }, () => ({ icon: 'time', time: '', text: 'x' }));

        expect(parseProgram(JSON.stringify({ entries }))).toHaveLength(30);
    });

    it('resolves to the default only while no readable programme is stored', () => {
        expect(resolveProgram(null)).toEqual(DEFAULT_PROGRAM);
        expect(resolveProgram('broken')).toEqual(DEFAULT_PROGRAM);
        expect(resolveProgram(serializeProgram([]))).toEqual([]);
    });
});
