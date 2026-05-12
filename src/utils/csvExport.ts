import { TimeEntry, DailyStats } from "~/src/types";
import { calculateDailyStats, formatDuration } from "./timeCalculations";

export function exportToCSV(entries: TimeEntry[], filename: string = "timetracker-export.csv"): void {
  const headers = [
    "Date",
    "Clock In",
    "Clock Out",
    "Break Start",
    "Break End",
    "Total Break (min)",
    "Worked (h:m)",
    "Late (min)",
    "Overtime (min)",
  ];

  const rows = entries.map((entry) => {
    const stats = calculateDailyStats(entry);
    return [
      entry.date,
      entry.clockInTime ? new Date(entry.clockInTime).toLocaleTimeString() : "-",
      entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString() : "-",
      entry.breakStartTime ? new Date(entry.breakStartTime).toLocaleTimeString() : "-",
      entry.breakEndTime ? new Date(entry.breakEndTime).toLocaleTimeString() : "-",
      entry.totalBreakDuration > 0 ? Math.round(entry.totalBreakDuration / 60000) : 0,
      `${stats.workedHours}:${String(stats.workedMinutes).padStart(2, "0")}`,
      stats.lateMinutes,
      stats.overtimeMinutes,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  downloadCSV(csvContent, filename);
}

export function exportWeeklySummary(
  weekData: Record<string, DailyStats>,
  weekStart: string,
  weekEnd: string,
  filename: string = "weekly-summary.csv"
): void {
  const headers = ["Date", "Day", "Worked Hours", "Break (min)", "Late (min)", "Overtime (min)", "Status"];

  const rows = Object.entries(weekData).map(([date, stats]) => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const status = stats.clockedIn ? "In Progress" : "Completed";

    return [
      date,
      dayName,
      `${stats.workedHours}:${String(stats.workedMinutes).padStart(2, "0")}`,
      stats.breakMinutes,
      stats.lateMinutes,
      stats.overtimeMinutes,
      status,
    ];
  });

  const csvContent = [
    `Weekly Summary (${weekStart} to ${weekEnd})`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  downloadCSV(csvContent, filename);
}

export function exportMonthlySummary(
  monthData: {
    month: string;
    year: number;
    totalWorkedHours: number;
    totalOvertimeMinutes: number;
    totalBreakMinutes: number;
    averageWorkedHours: number;
    daysWorked: number;
  },
  filename: string = "monthly-summary.csv"
): void {
  const csvContent = [
    "Monthly Summary Report",
    `${monthData.month} ${monthData.year}`,
    "",
    "Metric,Value",
    `Total Worked Hours,${monthData.totalWorkedHours.toFixed(2)}`,
    `Total Overtime Minutes,${monthData.totalOvertimeMinutes}`,
    `Total Break Minutes,${monthData.totalBreakMinutes}`,
    `Average Worked Hours/Day,${monthData.averageWorkedHours.toFixed(2)}`,
    `Days Worked,${monthData.daysWorked}`,
  ].join("\n");

  downloadCSV(csvContent, filename);
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
