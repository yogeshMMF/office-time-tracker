import { TimeEntry, DailyStats, WeeklyStats, MonthlyStats, BreakPeriod, BreakCalcResult } from "~/src/types";

export const OFFICE_START_MINUTES = 600;  // 10:00 AM
export const OFFICE_END_MINUTES = 1050;   // 7:30 PM
export const REQUIRED_WORK_MINUTES = 525; // 8h 45m
export const ALLOWED_BREAK_MINUTES = 45;

// ── Primitive helpers ────────────────────────────────────────────────────────

export function timeToMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "HH:MM" → minutes from midnight */
export function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** minutes from midnight → "HH:MM" */
export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function millisToMinutes(ms: number): number {
  return Math.floor(ms / 60000);
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Live tracker calculations ────────────────────────────────────────────────

export function calculateLateArrival(clockInMinutes: number): number {
  return Math.max(0, clockInMinutes - OFFICE_START_MINUTES);
}

export function calculateWorkedMinutes(entry: TimeEntry): number {
  if (!entry.clockInTime) return 0;

  const end = entry.clockOutTime ?? Date.now();
  const totalMs = end - entry.clockInTime;

  // Add any currently-active break that hasn't been ended yet
  const activeBreakMs =
    entry.breakStartTime && !entry.breakEndTime
      ? Date.now() - entry.breakStartTime
      : 0;

  const worked = totalMs - entry.totalBreakDuration - activeBreakMs;
  return Math.max(0, millisToMinutes(worked));
}

export function calculateRemainingWorkMinutes(entry: TimeEntry): number {
  return Math.max(0, REQUIRED_WORK_MINUTES - calculateWorkedMinutes(entry));
}

export function calculateRemainingBreakMinutes(entry: TimeEntry): number {
  return Math.max(0, ALLOWED_BREAK_MINUTES - millisToMinutes(entry.totalBreakDuration));
}

export function calculateOvertime(entry: TimeEntry): number {
  return Math.max(0, calculateWorkedMinutes(entry) - REQUIRED_WORK_MINUTES);
}

export function calculateDailyStats(entry: TimeEntry | null): DailyStats {
  const today = new Date().toISOString().split("T")[0];

  if (!entry || entry.date !== today) {
    return {
      date: today,
      workedHours: 0,
      workedMinutes: 0,
      breakMinutes: 0,
      remainingBreakMinutes: ALLOWED_BREAK_MINUTES,
      remainingWorkMinutes: REQUIRED_WORK_MINUTES,
      requiredWorkMinutes: REQUIRED_WORK_MINUTES,
      completionPercent: 0,
      isLate: false,
      lateMinutes: 0,
      overtimeMinutes: 0,
      clockedIn: false,
      breakActive: false,
    };
  }

  const worked = calculateWorkedMinutes(entry);
  const breakMins = millisToMinutes(entry.totalBreakDuration);
  const remaining = calculateRemainingWorkMinutes(entry);
  const lateMinutes = entry.clockInTime
    ? calculateLateArrival(timeToMinutes(new Date(entry.clockInTime)))
    : 0;
  const overtime = calculateOvertime(entry);
  const completion = Math.min(100, Math.round((worked / REQUIRED_WORK_MINUTES) * 100));

  return {
    date: today,
    workedHours: Math.floor(worked / 60),
    workedMinutes: worked % 60,
    breakMinutes: breakMins,
    remainingBreakMinutes: calculateRemainingBreakMinutes(entry),
    remainingWorkMinutes: remaining,
    requiredWorkMinutes: REQUIRED_WORK_MINUTES,
    completionPercent: completion,
    isLate: lateMinutes > 0,
    lateMinutes,
    overtimeMinutes: overtime,
    clockedIn: entry.clockInTime !== null && entry.clockOutTime === null,
    breakActive: entry.breakStartTime !== null && entry.breakEndTime === null,
  };
}

// ── Break calculator (manual entry) ─────────────────────────────────────────

/** Validate that break periods are in order and non-overlapping */
export function validateBreaks(breaks: BreakPeriod[]): string | null {
  for (const b of breaks) {
    if (!b.start || !b.end) return "All breaks need both start and end times.";
    if (parseHHMM(b.start) >= parseHHMM(b.end)) return "Break end must be after break start.";
  }

  for (let i = 1; i < breaks.length; i++) {
    if (parseHHMM(breaks[i].start) < parseHHMM(breaks[i - 1].end)) {
      return "Break periods must not overlap.";
    }
  }
  return null;
}

/**
 * Core calculation: given clock-in, optional clock-out, and manual break periods,
 * determine whether the 8h 45m target has been met.
 */
export function calculateFromBreaks(
  clockIn: string,  // "HH:MM"
  clockOut: string, // "HH:MM" or ""
  breaks: BreakPeriod[]
): BreakCalcResult {
  const inMins = parseHHMM(clockIn);
  const hasClockOut = clockOut.trim() !== "";
  const outMins = hasClockOut ? parseHHMM(clockOut) : timeToMinutes();

  const totalBreakMinutes = breaks.reduce((sum, b) => {
    if (!b.start || !b.end) return sum;
    return sum + Math.max(0, parseHHMM(b.end) - parseHHMM(b.start));
  }, 0);

  const totalElapsed = Math.max(0, outMins - inMins);
  const worked = Math.max(0, totalElapsed - totalBreakMinutes);
  const remaining = Math.max(0, REQUIRED_WORK_MINUTES - worked);
  const overtime = Math.max(0, worked - REQUIRED_WORK_MINUTES);
  const isComplete = worked >= REQUIRED_WORK_MINUTES;

  // Expected clock-out = clockIn + REQUIRED_WORK_MINUTES + total break
  const expectedOut = inMins + REQUIRED_WORK_MINUTES + totalBreakMinutes;
  const expectedClockOut = expectedOut < 24 * 60 ? minutesToHHMM(expectedOut) : null;

  return { totalBreakMinutes, workedMinutes: worked, remainingMinutes: remaining, isComplete, expectedClockOut, overtime };
}

// ── Weekly / monthly aggregates ──────────────────────────────────────────────

export function calculateWeeklyStats(entries: TimeEntry[]): WeeklyStats {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startStr = weekStart.toISOString().split("T")[0];
  const endStr = weekEnd.toISOString().split("T")[0];

  const weekEntries = entries.filter((e) => e.date >= startStr && e.date <= endStr);

  let totalWorkedHours = 0;
  let totalBreakMinutes = 0;
  let totalOvertimeMinutes = 0;
  const days: Record<string, DailyStats> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayEntry = weekEntries.find((e) => e.date === dateStr) || null;
    const stats = calculateDailyStats(dayEntry);
    days[dateStr] = stats;
    totalWorkedHours += stats.workedHours + stats.workedMinutes / 60;
    totalBreakMinutes += stats.breakMinutes;
    totalOvertimeMinutes += stats.overtimeMinutes;
  }

  return {
    weekStart: startStr,
    weekEnd: endStr,
    totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
    totalBreakMinutes,
    totalOvertimeMinutes,
    days,
  };
}

export function calculateMonthlyStats(entries: TimeEntry[]): MonthlyStats {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startStr = monthStart.toISOString().split("T")[0];
  const endStr = monthEnd.toISOString().split("T")[0];

  const monthEntries = entries.filter((e) => e.date >= startStr && e.date <= endStr);

  let totalWorkedHours = 0;
  let totalOvertimeMinutes = 0;
  let totalBreakMinutes = 0;
  let daysWorked = 0;

  for (const entry of monthEntries) {
    const worked = calculateWorkedMinutes(entry);
    totalWorkedHours += worked / 60;
    totalOvertimeMinutes += calculateOvertime(entry);
    totalBreakMinutes += millisToMinutes(entry.totalBreakDuration);
    daysWorked++;
  }

  return {
    month: monthStart.toLocaleString("default", { month: "long" }),
    year: monthStart.getFullYear(),
    totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
    totalOvertimeMinutes,
    totalBreakMinutes,
    averageWorkedHours: daysWorked > 0 ? Math.round((totalWorkedHours / daysWorked) * 100) / 100 : 0,
    daysWorked,
  };
}

export function getWeekRange(date = new Date()) {
  const s = new Date(date);
  s.setDate(date.getDate() - date.getDay());
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return { start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] };
}

export function getMonthRange(date = new Date()) {
  const s = new Date(date.getFullYear(), date.getMonth(), 1);
  const e = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] };
}
