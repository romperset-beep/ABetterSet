
// Standalone Test for Payroll Logic (Copies logic from payrollUtils.ts)

interface TimeEntry {
    start: string;
    end: string;
    mealDuration: number;
}

// Helper to parse time string "HH:mm" to decimal hours
const timeToDecimal = (t: string): number => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h + (m / 60);
};

const calculateShiftDetails = (entry: TimeEntry) => {
    let start = timeToDecimal(entry.start);
    let end = timeToDecimal(entry.end);

    if (end < start) {
        end += 24;
    }

    const amplitude = end - start;
    const effectiveHours = Math.max(0, amplitude - entry.mealDuration);

    const night20_22_start = 20; const night20_22_end = 22;
    const night22_24_start = 22; const night22_24_end = 24;
    const night00_06_start = 0; const night00_06_end = 6;
    const next_night00_06_start = 24; const next_night00_06_end = 30;

    let n20_22 = 0; let n22_24 = 0; let n00_06 = 0;

    const getOverlap = (s1: number, e1: number, s2: number, e2: number) => {
        return Math.max(0, Math.min(e1, e2) - Math.max(s1, s2));
    };

    // 1. Morning Day 1
    n00_06 += getOverlap(start, end, night00_06_start, night00_06_end);

    // 2. Evening Day 1
    n20_22 += getOverlap(start, end, night20_22_start, night20_22_end);
    n22_24 += getOverlap(start, end, night22_24_start, night22_24_end);

    // 3. Morning Day 2
    n00_06 += getOverlap(start, end, next_night00_06_start, next_night00_06_end);

    return {
        amplitude: Number(amplitude.toFixed(2)),
        effectiveHours: Number(effectiveHours.toFixed(2)),
        nightHours22_24: Number(n22_24.toFixed(2)),
        nightHours00_06: Number(n00_06.toFixed(2))
    };
};

// --- RUN TEST ---
// Test Case: GUYON JEAN PAUL (Line 10)
// Lundi: 16:00 -> 02:40 (lendemain)
// Repas: 1h

const testShift = { start: '16:00', end: '02:40', mealDuration: 1 };
const result = calculateShiftDetails(testShift);

console.log("Input:", testShift);
console.log("Result:", result);

if (result.nightHours22_24 === 2.0 && result.nightHours00_06 > 2.6) {
    console.log("SUCCESS: Logic verified.");
} else {
    console.log("FAILURE");
    process.exit(1);
}
