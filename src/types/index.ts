export interface BreakPeriod {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  clockInTime: number | null;
  clockOutTime: number | null;
  breakStartTime: number | null;
  breakEndTime: number | null;
  totalBreakDuration: number; // ms
  breaks: BreakPeriod[];      // manual break periods (used by calculator)
  isLate: boolean;
  overtimeMinutes: number;
  workedMinutes: number;
}

export interface DailyStats {
  date: string;
  workedHours: number;
  workedMinutes: number;
  breakMinutes: number;
  remainingBreakMinutes: number;
  remainingWorkMinutes: number;
  requiredWorkMinutes: number;   // always 525 (8h 45m)
  completionPercent: number;     // 0–100+
  isLate: boolean;
  lateMinutes: number;
  overtimeMinutes: number;
  clockedIn: boolean;
  breakActive: boolean;
}

export interface BreakCalcResult {
  totalBreakMinutes: number;
  workedMinutes: number;
  remainingMinutes: number;     // 0 if target met
  isComplete: boolean;
  expectedClockOut: string | null; // "HH:MM" — when to leave to hit target
  overtime: number;             // minutes beyond target
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWorkedHours: number;
  totalBreakMinutes: number;
  totalOvertimeMinutes: number;
  days: Record<string, DailyStats>;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalWorkedHours: number;
  totalOvertimeMinutes: number;
  totalBreakMinutes: number;
  averageWorkedHours: number;
  daysWorked: number;
}

export interface TrackerState {
  currentEntry: TimeEntry | null;
  today: string;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
}

export interface StorageData {
  entries: TimeEntry[];
  state: TrackerState;
  settings: AppSettings;
}

export interface AppSettings {
  officeStartTime: number;      // minutes from midnight (600 = 10:00)
  officeEndTime: number;        // minutes from midnight (1050 = 17:30)
  allowedBreakMinutes: number;  // 45
  requiredWorkMinutes: number;  // 525 = 8h 45m
  notificationReminders: boolean;
  darkMode: boolean;
}
