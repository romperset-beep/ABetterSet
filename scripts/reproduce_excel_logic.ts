
import { parse } from 'csv-parse/sync';
import fs from 'fs';

// Excel Data for GUYON JEAN PAUL (Line 10)
// Lundi: 16:00 - 02:40 (Next Day), Repas 1h (deduced from context/other lines, though strictly not explicit in calc file for line 10, let's assume standard logic or 0 if continuous)
// Actually looking at Line 6 (Feuille de service): Repas 19:00-20:00 (1h)
// Let's implement a single day calculator first.

interface DailyShift {
    day: string;
    start: string; // HH:mm
    end: string;   // HH:mm
    mealDuration: number; // in hours
    isContinuous: boolean;
}

// Helper to parse time string "HH:mm" to decimal hours
// If end < start, assumed next day (+24h)
const timeToDecimal = (t: string): number => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h + (m / 60);
};

const calculateDaily = (shift: DailyShift) => {
    let start = timeToDecimal(shift.start);
    let end = timeToDecimal(shift.end);

    // Handle overnight (e.g. 16:00 to 02:40)
    if (end < start) {
        end += 24;
    }

    const amplitude = end - start;
    const effectiveWork = amplitude - shift.mealDuration;

    // Night Hours Logic from headers: 
    // "H nuit 20 à 24" -> 20h to 24h
    // "H nuit 0 à 6"   -> 00h to 06h

    let nightHours2024 = 0;
    let nightHours06 = 0;

    // Check overlap with 20:00 - 24:00 (20 - 24)
    // Shift is [start, end]
    // Interval is [20, 24]

    // We handle the "end > 24" case by checking both [20, 24] and potentially [44, 48] if it spans multiple days? 
    // No, usually just linear timeline 0..infinity relative to start day.

    // Overlap 20-24
    const overlap20_24 = Math.max(0, Math.min(end, 24) - Math.max(start, 20));
    nightHours2024 += overlap20_24;

    // Overlap 00-06 (next day, i.e., 24-30 in our timeline)
    // Also check 00-06 of current day if start is in it?
    // Usually cinema shoots start PM and end AM.
    // Let's assume standard breakdown:
    // 00-06 (Morning of Day 1) : [0, 6]
    // 20-24 (Evening of Day 1) : [20, 24]
    // 00-06 (Morning of Day 2) : [24, 30]

    // Overlap Morning Day 1
    const overlap0_6_Day1 = Math.max(0, Math.min(end, 6) - Math.max(start, 0));
    nightHours06 += overlap0_6_Day1;

    // Overlap Morning Day 2 (24 to 30)
    const overlap0_6_Day2 = Math.max(0, Math.min(end, 30) - Math.max(start, 24));
    nightHours06 += overlap0_6_Day2;

    return {
        amplitude: amplitude.toFixed(2),
        effectiveWork: effectiveWork.toFixed(2),
        night2024: nightHours2024.toFixed(2),
        night06: nightHours06.toFixed(2)
    };
};

console.log("--- TEST REPRODUCTION EXCEL (Line 10: GUYON JEAN PAUL) ---");
console.log("Lundi: 16:00 -> 02:40 (lendemain)");
// Note: meal break is crucial. Excel says "1h" usually. 
// "Feuille de service" usually dictates the break. If he took it, effective is less.
// Let's assume standard 1h meal.
const resultLundi = calculateDaily({
    day: 'Lundi',
    start: '16:00',
    end: '02:40',
    mealDuration: 1,
    isContinuous: false
});

console.log("Calculated:", resultLundi);
console.log("Excel Target (approx): Work ~9.67h (9h40), Night20-24: ?, Night0-6: ?");

