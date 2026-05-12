import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import * as storage from "~/src/utils/storage";
import * as calc from "~/src/utils/timeCalculations";
import { exportToCSV, exportMonthlySummary } from "~/src/utils/csvExport";
import type { WeeklyStats, MonthlyStats } from "~/src/types";

type Period = "week" | "month";

const CHART_COLORS = ["#3b82f6", "#d1d5db"];

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [chartData, setChartData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [allEntries, setAllEntries] = useState<Awaited<ReturnType<typeof storage.getStorageData>>["entries"]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await storage.getStorageData();
      const entries = data.entries;
      setAllEntries(entries);

      if (period === "week") {
        const stats = calc.calculateWeeklyStats(entries);
        setWeeklyStats(stats);
        setMonthlyStats(null);

        const barData = Object.entries(stats.days).map(([date, day]) => ({
          day: new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
          Worked: +(day.workedHours + day.workedMinutes / 60).toFixed(2),
          Overtime: +(day.overtimeMinutes / 60).toFixed(2),
        }));
        setChartData(barData);
      } else {
        const stats = calc.calculateMonthlyStats(entries);
        setMonthlyStats(stats);
        setWeeklyStats(null);

        const expectedHours = 7.5 * stats.daysWorked;
        setChartData([
          { name: "Worked", value: +stats.totalWorkedHours.toFixed(2), fill: CHART_COLORS[0] },
          { name: "Expected", value: +expectedHours.toFixed(2), fill: CHART_COLORS[1] },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (period === "week" && weeklyStats) {
      const weekEntries = allEntries.filter(
        (e) => e.date >= weeklyStats.weekStart && e.date <= weeklyStats.weekEnd
      );
      exportToCSV(weekEntries, `week-${weeklyStats.weekStart}.csv`);
    } else if (monthlyStats) {
      exportMonthlySummary(monthlyStats, `month-${monthlyStats.month}-${monthlyStats.year}.csv`);
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Period toggle */}
      <div className="flex gap-2">
        {(["week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {p === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {period === "week" && weeklyStats && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard label="Total Worked" value={`${weeklyStats.totalWorkedHours.toFixed(1)}h`} />
            <SummaryCard label="Avg/Day" value={`${(weeklyStats.totalWorkedHours / 7).toFixed(1)}h`} />
            <SummaryCard label="Break Total" value={`${weeklyStats.totalBreakMinutes}m`} />
            <SummaryCard label="Overtime" value={`${weeklyStats.totalOvertimeMinutes}m`} />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Daily Hours</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}h`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Worked" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Overtime" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {period === "month" && monthlyStats && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard label="Total Worked" value={`${monthlyStats.totalWorkedHours.toFixed(1)}h`} />
            <SummaryCard label="Avg/Day" value={`${monthlyStats.averageWorkedHours.toFixed(1)}h`} />
            <SummaryCard label="Days Worked" value={String(monthlyStats.daysWorked)} />
            <SummaryCard label="Overtime" value={`${monthlyStats.totalOvertimeMinutes}m`} />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              {monthlyStats.month} {monthlyStats.year}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}h`}
                  labelLine={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}h`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        Export CSV
      </button>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{value}</div>
    </div>
  );
}
