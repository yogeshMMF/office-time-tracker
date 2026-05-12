import { TimeEntry } from "~/src/types";

const IDB_NAME = "TimeTrackerFS";
const IDB_STORE = "handles";
const HANDLE_KEY = "workFolder";

// ── IndexedDB helpers (persist FileSystemDirectoryHandle) ───────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

// ── Directory handle management ──────────────────────────────────────────────

export async function getSavedFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await idbGet<FileSystemDirectoryHandle>(HANDLE_KEY);
    if (!handle) return null;
    // Verify permission is still granted
    const perm = await handle.queryPermission({ mode: "readwrite" });
    if (perm === "granted") return handle;
    // Try to re-request (requires user gesture — will fail silently here)
    return null;
  } catch {
    return null;
  }
}

/** Call from a button click (requires user gesture) */
export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!("showDirectoryPicker" in window)) {
    alert("Your browser does not support the File System Access API.\nUse Chrome 86+ to enable local folder saving.");
    return null;
  }
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: "readwrite", startIn: "documents" });
    await idbPut(HANDLE_KEY, handle);
    return handle;
  } catch (e: any) {
    if (e.name !== "AbortError") console.error("Folder picker error:", e);
    return null;
  }
}

export async function clearSavedFolder(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
  });
}

export async function getFolderName(): Promise<string | null> {
  const handle = await getSavedFolder();
  return handle?.name ?? null;
}

// ── File I/O ─────────────────────────────────────────────────────────────────

interface DailyRecord {
  date: string;
  savedAt: string;
  entry: TimeEntry;
}

export async function saveDailyRecord(entry: TimeEntry): Promise<boolean> {
  const folder = await getSavedFolder();
  if (!folder) return false;

  try {
    const perm = await folder.requestPermission({ mode: "readwrite" });
    if (perm !== "granted") return false;

    const record: DailyRecord = {
      date: entry.date,
      savedAt: new Date().toISOString(),
      entry,
    };

    const filename = `${entry.date}.json`;
    const fileHandle = await folder.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(record, null, 2));
    await writable.close();
    return true;
  } catch (e) {
    console.error("Failed to save daily record:", e);
    return false;
  }
}

export async function loadDailyRecord(date: string): Promise<DailyRecord | null> {
  const folder = await getSavedFolder();
  if (!folder) return null;

  try {
    const fileHandle = await folder.getFileHandle(`${date}.json`);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as DailyRecord;
  } catch {
    return null;
  }
}

/** Load all JSON records from the folder and return as TimeEntry[] */
export async function loadAllRecords(): Promise<TimeEntry[]> {
  const folder = await getSavedFolder();
  if (!folder) return [];

  const entries: TimeEntry[] = [];
  try {
    for await (const [name, handle] of (folder as any).entries()) {
      if (!name.endsWith(".json")) continue;
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        const record: DailyRecord = JSON.parse(text);
        if (record.entry) entries.push(record.entry);
      } catch {
        // skip corrupt files
      }
    }
  } catch (e) {
    console.error("Failed to read folder:", e);
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
