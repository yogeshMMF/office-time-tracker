import { useEffect, useRef, useState, useCallback } from "react";
import { TimeEntry, DailyStats } from "~/src/types";
import * as storage from "~/src/utils/storage";
import * as calc from "~/src/utils/timeCalculations";
import { NotificationManager } from "~/src/utils/notifications";
import { IdleDetector } from "~/src/utils/idleDetection";
import { saveDailyRecord } from "~/src/utils/fileStorage";

export function useTimeTracker() {
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [stats, setStats] = useState<DailyStats>(calc.calculateDailyStats(null));
  const [loading, setLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);

  const idleDetector = useRef(new IdleDetector(300000));
  const entryRef = useRef<TimeEntry | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const todayEntry = await storage.getTodayEntry();
        entryRef.current = todayEntry;
        setEntry(todayEntry);
        setStats(calc.calculateDailyStats(todayEntry));
      } finally {
        setLoading(false);
      }
    };
    load();
    idleDetector.current.start((idle) => setIsIdle(idle));
    return () => idleDetector.current.stop();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStats(calc.calculateDailyStats(entryRef.current)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isIdle && entryRef.current?.breakStartTime) {
      NotificationManager.showIdleWarning();
    }
  }, [isIdle]);

  function commit(updated: TimeEntry) {
    entryRef.current = updated;
    setEntry(updated);
    setStats(calc.calculateDailyStats(updated));
  }

  const clockIn = useCallback(async () => {
    const now = Date.now();
    const newEntry: TimeEntry = {
      id: storage.generateId(),
      date: new Date().toISOString().split("T")[0],
      clockInTime: now,
      clockOutTime: null,
      breakStartTime: null,
      breakEndTime: null,
      totalBreakDuration: 0,
      breaks: [],
      isLate: calc.calculateLateArrival(calc.timeToMinutes()) > 0,
      overtimeMinutes: 0,
      workedMinutes: 0,
    };
    await storage.addTimeEntry(newEntry);
    commit(newEntry);
    NotificationManager.showSuccess("Clocked In", "Your work session has started.");
  }, []);

  const clockOut = useCallback(async () => {
    if (!entryRef.current) return;
    const updated: TimeEntry = { ...entryRef.current, clockOutTime: Date.now() };
    await storage.updateTimeEntry(updated);
    commit(updated);
    // Auto-save to local folder if configured
    saveDailyRecord(updated).catch(() => {});
    NotificationManager.showSuccess("Clocked Out", "Have a great evening!");
  }, []);

  const startBreak = useCallback(async () => {
    if (!entryRef.current) return;
    const updated: TimeEntry = { ...entryRef.current, breakStartTime: Date.now(), breakEndTime: null };
    await storage.updateTimeEntry(updated);
    commit(updated);
    NotificationManager.showSuccess("Break Started", "Break timer is running.");
  }, []);

  const endBreak = useCallback(async () => {
    const cur = entryRef.current;
    if (!cur?.breakStartTime) return;
    const duration = Date.now() - cur.breakStartTime;
    const updated: TimeEntry = {
      ...cur,
      breakEndTime: Date.now(),
      totalBreakDuration: cur.totalBreakDuration + duration,
      breakStartTime: null,
      // Append to the named breaks list for the calculator
      breaks: [
        ...cur.breaks,
        {
          start: calc.minutesToHHMM(calc.timeToMinutes(new Date(cur.breakStartTime))),
          end: calc.minutesToHHMM(calc.timeToMinutes()),
        },
      ],
    };
    await storage.updateTimeEntry(updated);
    commit(updated);
    NotificationManager.showSuccess("Break Ended", "Back to work!");
  }, []);

  const refresh = useCallback(async () => {
    const todayEntry = await storage.getTodayEntry();
    entryRef.current = todayEntry;
    setEntry(todayEntry);
    setStats(calc.calculateDailyStats(todayEntry));
  }, []);

  return { entry, stats, loading, isIdle, clockIn, clockOut, startBreak, endBreak, refresh };
}
