import { StorageData, TimeEntry, TrackerState, AppSettings } from "~/src/types";
import { REQUIRED_WORK_MINUTES } from "~/src/utils/timeCalculations";

const STORAGE_KEY = "office_tracker_data";

export const DEFAULT_SETTINGS: AppSettings = {
  officeStartTime: 600,
  officeEndTime: 1050,
  allowedBreakMinutes: 45,
  requiredWorkMinutes: REQUIRED_WORK_MINUTES,
  notificationReminders: true,
  darkMode: false,
};

const DEFAULT_STATE: TrackerState = {
  currentEntry: null,
  today: new Date().toISOString().split("T")[0],
  isDarkMode: false,
  notificationsEnabled: true,
};

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        const data = result[STORAGE_KEY] as StorageData;
        // Back-fill missing fields for entries saved before schema update
        data.entries = data.entries.map((e) => ({ breaks: [], ...e }));
        resolve(data);
      } else {
        const defaultData: StorageData = {
          entries: [],
          state: DEFAULT_STATE,
          settings: DEFAULT_SETTINGS,
        };
        chrome.storage.local.set({ [STORAGE_KEY]: defaultData }, () => resolve(defaultData));
      }
    });
  });
}

export async function saveStorageData(data: StorageData): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => resolve());
  });
}

export async function addTimeEntry(entry: TimeEntry): Promise<void> {
  const data = await getStorageData();
  // Replace any existing entry for the same date (avoid duplicates)
  data.entries = data.entries.filter((e) => e.date !== entry.date);
  data.entries.push(entry);
  await saveStorageData(data);
}

export async function updateTimeEntry(entry: TimeEntry): Promise<void> {
  const data = await getStorageData();
  const idx = data.entries.findIndex((e) => e.id === entry.id);
  if (idx !== -1) {
    data.entries[idx] = entry;
    await saveStorageData(data);
  }
}

export async function getTodayEntry(): Promise<TimeEntry | null> {
  const data = await getStorageData();
  const today = new Date().toISOString().split("T")[0];
  return data.entries.find((e) => e.date === today) ?? null;
}

export async function getEntries(startDate: string, endDate: string): Promise<TimeEntry[]> {
  const data = await getStorageData();
  return data.entries.filter((e) => e.date >= startDate && e.date <= endDate);
}

export async function updateState(state: Partial<TrackerState>): Promise<void> {
  const data = await getStorageData();
  data.state = { ...data.state, ...state };
  await saveStorageData(data);
}

export async function getState(): Promise<TrackerState> {
  const data = await getStorageData();
  return data.state;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<void> {
  const data = await getStorageData();
  data.settings = { ...data.settings, ...settings };
  await saveStorageData(data);
}

export async function getSettings(): Promise<AppSettings> {
  const data = await getStorageData();
  return { ...DEFAULT_SETTINGS, ...data.settings };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function deleteAllData(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([STORAGE_KEY], () => resolve());
  });
}
