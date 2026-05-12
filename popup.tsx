import React, { useState } from "react";
import { Clock, Play, Coffee, LogOut } from "lucide-react";
import { useTimeTracker } from "~/src/hooks/useTimeTracker";
import { formatDuration, REQUIRED_WORK_MINUTES } from "~/src/utils/timeCalculations";
import { DailyStats, TimeEntry } from "~/src/types";
import Dashboard from "~/src/components/Dashboard";
import SettingsPanel from "~/src/components/Settings";
import BreakCalculator from "~/src/components/BreakCalculator";
import "~/src/styles/popup.css";

type View = "timer" | "breaks" | "dashboard" | "settings";

const TABS: { id: View; label: string }[] = [
  { id: "timer", label: "Timer" },
  { id: "breaks", label: "Breaks" },
  { id: "dashboard", label: "Stats" },
  { id: "settings", label: "Settings" },
];

export default function Popup() {
  const { entry, stats, loading, clockIn, clockOut, startBreak, endBreak, isIdle } = useTimeTracker();
  const [view, setView] = useState<View>("timer");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  if (loading) {
    return (
      <div className="flex items-center justify-center w-96 h-28 bg-white dark:bg-gray-900">
        <Clock className="animate-spin text-blue-500" size={26} />
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="w-96 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h1 className="text-base font-bold tracking-tight">Office Time Tracker</h1>
          </div>
          {isIdle && stats.breakActive && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded font-medium">
              IDLE
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                view === id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[520px] overflow-y-auto">
          {view === "timer" && (
            <TimerView
              stats={stats}
              entry={entry}
              onClockIn={clockIn}
              onClockOut={clockOut}
              onStartBreak={startBreak}
              onEndBreak={endBreak}
              isIdle={isIdle}
            />
          )}
          {view === "breaks" && <BreakCalculator />}
          {view === "dashboard" && <Dashboard />}
          {view === "settings" && <SettingsPanel onThemeChange={setTheme} />}
        </div>
      </div>
    </div>
  );
}

// ── Timer view ────────────────────────────────────────────────────────────────

interface TimerViewProps {
  stats: DailyStats;
  entry: TimeEntry | null;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  onStartBreak: () => Promise<void>;
  onEndBreak: () => Promise<void>;
  isIdle: boolean;
}

function TimerView({ stats, onClockIn, onClockOut, onStartBreak, onEndBreak, isIdle }: TimerViewProps) {
  const [busy, setBusy] = useState(false);
  const wrap = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  const pct = stats.completionPercent ?? Math.min(100, Math.round(
    ((stats.workedHours * 60 + stats.workedMinutes) / REQUIRED_WORK_MINUTES) * 100
  ));

  return (
    <div className="space-y-4">
      {/* Live worked time */}
      <div className="text-center space-y-1">
        <div className="text-xs text-gray-400">{stats.date}</div>
        <div className="text-5xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
          {String(stats.workedHours).padStart(2, "0")}:{String(stats.workedMinutes).padStart(2, "0")}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {stats.clockedIn ? (stats.breakActive ? "On Break" : "Working") : "Not Clocked In"}
        </div>
      </div>

      {/* Progress toward 8h 45m */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress (target 8h 45m)</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${pct >= 100 ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Remaining Work"
          value={stats.remainingWorkMinutes > 0 ? formatDuration(stats.remainingWorkMinutes) : "Done ✓"}
          color={stats.remainingWorkMinutes === 0 ? "green" : "blue"}
        />
        <StatCard
          label="Break Used"
          value={`${stats.breakMinutes}m / 45m`}
          color={stats.breakMinutes > 45 ? "red" : "green"}
        />
        <StatCard
          label="Late Arrival"
          value={stats.lateMinutes > 0 ? `${stats.lateMinutes}m late` : "On time"}
          color={stats.lateMinutes > 0 ? "red" : "gray"}
        />
        <StatCard
          label="Overtime"
          value={stats.overtimeMinutes > 0 ? `+${formatDuration(stats.overtimeMinutes)}` : "—"}
          color={stats.overtimeMinutes > 0 ? "orange" : "gray"}
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!stats.clockedIn ? (
          <button onClick={wrap(onClockIn)} disabled={busy}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <Play size={16} /> Clock In
          </button>
        ) : (
          <>
            <button onClick={wrap(stats.breakActive ? onEndBreak : onStartBreak)} disabled={busy}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Coffee size={16} />
              {stats.breakActive ? "End Break" : "Start Break"}
            </button>
            <button onClick={wrap(onClockOut)} disabled={busy}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <LogOut size={16} /> Clock Out
            </button>
          </>
        )}
      </div>

      {isIdle && stats.breakActive && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200">
          ⚠️ You appear idle — break timer is still running.
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "red" | "green" | "blue" | "orange" | "gray" }) {
  const cls = {
    red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
    green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
    blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    orange: "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    gray: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  }[color];

  return (
    <div className={`border rounded-lg p-2.5 ${cls}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</div>
    </div>
  );
}
