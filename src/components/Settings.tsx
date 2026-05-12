import React, { useEffect, useState } from "react";
import { Moon, Sun, Download, Trash2, Bell, FolderOpen, FolderX, Save } from "lucide-react";
import * as storage from "~/src/utils/storage";
import { exportToCSV } from "~/src/utils/csvExport";
import { pickFolder, getFolderName, clearSavedFolder, saveDailyRecord, loadAllRecords } from "~/src/utils/fileStorage";

interface SettingsProps {
  onThemeChange: (theme: "light" | "dark") => void;
}

export default function Settings({ onThemeChange }: SettingsProps) {
  const [officeStart, setOfficeStart] = useState("10:00");
  const [officeEnd, setOfficeEnd] = useState("19:30");
  const [breakMinutes, setBreakMinutes] = useState(45);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    getFolderName().then(setFolderName);
  }, []);

  async function loadSettings() {
    try {
      const s = await storage.getSettings();
      setOfficeStart(mins(s.officeStartTime));
      setOfficeEnd(mins(s.officeEndTime));
      setBreakMinutes(s.allowedBreakMinutes);
      setNotifications(s.notificationReminders);
      setDarkMode(s.darkMode);
      onThemeChange(s.darkMode ? "dark" : "light");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    const [sh, sm] = officeStart.split(":").map(Number);
    const [eh, em] = officeEnd.split(":").map(Number);
    await storage.updateSettings({
      officeStartTime: sh * 60 + sm,
      officeEndTime: eh * 60 + em,
      allowedBreakMinutes: breakMinutes,
      notificationReminders: notifications,
      darkMode,
    });
    onThemeChange(darkMode ? "dark" : "light");
  }

  async function handlePickFolder() {
    const handle = await pickFolder();
    if (handle) setFolderName(handle.name);
  }

  async function handleClearFolder() {
    await clearSavedFolder();
    setFolderName(null);
  }

  async function handleSaveNow() {
    setSaveStatus("saving");
    const entry = await storage.getTodayEntry();
    if (!entry) { setSaveStatus("err"); return; }
    const ok = await saveDailyRecord(entry);
    setSaveStatus(ok ? "ok" : "err");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  async function handleImport() {
    setImportStatus("Importing…");
    try {
      const records = await loadAllRecords();
      if (!records.length) { setImportStatus("No JSON files found in folder."); return; }
      for (const entry of records) await storage.addTimeEntry(entry);
      setImportStatus(`Imported ${records.length} records.`);
    } catch {
      setImportStatus("Import failed.");
    }
    setTimeout(() => setImportStatus(null), 3000);
  }

  async function handleExportCSV() {
    const data = await storage.getStorageData();
    exportToCSV(data.entries);
  }

  async function handleReset() {
    if (window.confirm("Delete all time tracking data? This cannot be undone.")) {
      await storage.deleteAllData();
      window.location.reload();
    }
  }

  if (loading) return <div className="text-center py-8 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">

      {/* Appearance */}
      <Section title="Appearance">
        <Toggle
          label="Dark Mode"
          icon={darkMode ? <Moon size={16} /> : <Sun size={16} />}
          checked={darkMode}
          onChange={(v) => { setDarkMode(v); save(); }}
        />
      </Section>

      {/* Office Hours */}
      <Section title="Office Hours">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start</label>
            <input type="time" value={officeStart} onChange={(e) => setOfficeStart(e.target.value)} onBlur={save}
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End</label>
            <input type="time" value={officeEnd} onChange={(e) => setOfficeEnd(e.target.value)} onBlur={save}
              className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Break allowance (min)</label>
          <input type="number" min={0} max={120} value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))} onBlur={save}
            className={inputCls} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Required work: 8h 45m per day</p>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Toggle
          label="Enable Reminders"
          icon={<Bell size={16} />}
          checked={notifications}
          onChange={(v) => { setNotifications(v); save(); }}
        />
      </Section>

      {/* Local Folder */}
      <Section title="Work History Folder">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose a local folder where daily records are saved as JSON files (one per day).
        </p>

        {folderName ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300 truncate">{folderName}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveNow}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                <Save size={13} />
                {saveStatus === "saving" ? "Saving…" : saveStatus === "ok" ? "Saved ✓" : saveStatus === "err" ? "Failed ✗" : "Save Today"}
              </button>
              <button onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                Import Records
              </button>
              <button onClick={handleClearFolder}
                className="text-gray-400 hover:text-red-500 transition-colors px-2">
                <FolderX size={15} />
              </button>
            </div>
            {importStatus && <p className="text-xs text-blue-600 dark:text-blue-400">{importStatus}</p>}
          </div>
        ) : (
          <button onClick={handlePickFolder}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
            <FolderOpen size={16} />
            Choose Folder
          </button>
        )}
      </Section>

      {/* Data Management */}
      <Section title="Data Management">
        <button onClick={handleExportCSV}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
          <Download size={16} /> Export All as CSV
        </button>
        <button onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
          <Trash2 size={16} /> Reset All Data
        </button>
      </Section>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-2">Office Time Tracker v1.0.0</p>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────

function mins(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

const inputCls =
  "w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, icon, checked, onChange }: {
  label: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        {icon} {label}
      </span>
      <div className={`w-9 h-5 rounded-full transition-colors relative ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}
