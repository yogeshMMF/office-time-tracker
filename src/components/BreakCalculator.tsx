import React, { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { BreakPeriod } from "~/src/types";
import {
  calculateFromBreaks,
  validateBreaks,
  formatDuration,
  REQUIRED_WORK_MINUTES,
  timeToMinutes,
  minutesToHHMM,
} from "~/src/utils/timeCalculations";
import { getTodayEntry } from "~/src/utils/storage";

export default function BreakCalculator() {
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breaks, setBreaks] = useState<BreakPeriod[]>([{ start: "", end: "" }]);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from today's entry if available
  useEffect(() => {
    getTodayEntry().then((entry) => {
      if (!entry) return;
      if (entry.clockInTime) setClockIn(minutesToHHMM(timeToMinutes(new Date(entry.clockInTime))));
      if (entry.clockOutTime) setClockOut(minutesToHHMM(timeToMinutes(new Date(entry.clockOutTime))));
      if (entry.breaks?.length) setBreaks(entry.breaks);
    });
  }, []);

  // Derive result whenever inputs change
  const validBreaks = breaks.filter((b) => b.start && b.end);
  const validationError = clockIn ? validateBreaks(validBreaks) : null;
  const result = clockIn && !validationError ? calculateFromBreaks(clockIn, clockOut, validBreaks) : null;

  function addBreak() {
    setBreaks((prev) => [...prev, { start: "", end: "" }]);
  }

  function removeBreak(i: number) {
    setBreaks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateBreak(i: number, field: "start" | "end", val: string) {
    setBreaks((prev) => prev.map((b, idx) => (idx === i ? { ...b, [field]: val } : b)));
  }

  const progressPct = result ? Math.min(100, Math.round((result.workedMinutes / REQUIRED_WORK_MINUTES) * 100)) : 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter your times to check if 8h 45m is complete. Auto-filled from today's clock record when available.
      </p>

      {/* Clock In / Out */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            Clock In
          </label>
          <input
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            Clock Out <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Break periods */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Break Periods</span>
          <button
            onClick={addBreak}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            <Plus size={13} /> Add Break
          </button>
        </div>

        {breaks.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
            <input
              type="time"
              value={b.start}
              onChange={(e) => updateBreak(i, "start", e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white"
            />
            <span className="text-gray-400 text-xs">—</span>
            <input
              type="time"
              value={b.end}
              onChange={(e) => updateBreak(i, "end", e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={() => removeBreak(i)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {validationError}
        </div>
      )}

      {/* Result */}
      {result && !validationError && (
        <div className="space-y-3 pt-1">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress toward 8h 45m</span>
              <span className="font-medium">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  result.isComplete ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <ResultCard
              label="Worked"
              value={formatDuration(result.workedMinutes)}
              sub={`of ${formatDuration(REQUIRED_WORK_MINUTES)} target`}
              color="blue"
            />
            <ResultCard
              label="Total Break"
              value={`${result.totalBreakMinutes}m`}
              sub={result.totalBreakMinutes > 45 ? `+${result.totalBreakMinutes - 45}m over limit` : "within limit"}
              color={result.totalBreakMinutes > 45 ? "red" : "green"}
            />
          </div>

          {/* Status banner */}
          {result.isComplete ? (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Target Complete ✓</p>
                {result.overtime > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatDuration(result.overtime)} overtime
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
              <Clock size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {formatDuration(result.remainingMinutes)} remaining
                </p>
                {result.expectedClockOut && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Leave at{" "}
                    <span className="font-mono font-semibold">{result.expectedClockOut}</span>
                    {" "}to complete 8h 45m
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!clockIn && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">
          Enter a clock-in time to see your work status.
        </p>
      )}
    </div>
  );
}

function ResultCard({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "red";
}) {
  const bg = {
    blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
    red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  }[color];

  return (
    <div className={`border rounded-lg p-2.5 ${bg}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
