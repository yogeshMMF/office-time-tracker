# Office Time Tracker — Setup & Usage Guide

Developer-only Chrome extension. Free, no Chrome Web Store, no account required.
Built with **React + TypeScript + TailwindCSS + Vite + @crxjs**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [First-Time Setup](#2-first-time-setup)
3. [Load in Chrome (Developer Mode)](#3-load-in-chrome-developer-mode)
4. [How to Use the Extension](#4-how-to-use-the-extension)
   - [Timer Tab](#timer-tab)
   - [Breaks Tab — Work Calculator](#breaks-tab--work-calculator)
   - [Stats Tab — Analytics](#stats-tab--analytics)
   - [Settings Tab](#settings-tab)
5. [Local Folder — Work History](#5-local-folder--work-history)
6. [Development Workflow](#6-development-workflow)
7. [Debugging](#7-debugging)
8. [Sharing the Extension (no Web Store)](#8-sharing-the-extension-no-web-store)
9. [Troubleshooting](#9-troubleshooting)
10. [Project Structure](#10-project-structure)

---

## 1. Prerequisites

| Requirement | Version | Download |
|---|---|---|
| Node.js | 18 LTS or higher | https://nodejs.org |
| Google Chrome | 103+ | https://google.com/chrome |
| npm | bundled with Node.js | — |

Verify your versions:
```bash
node -v    # should print v18.x.x or higher
npm -v     # should print 9.x.x or higher
```

---

## 2. First-Time Setup

Open a terminal in the `TimeTracker/` project folder and run these steps in order.

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Generate icons
```bash
node --input-type=module < scripts/generate-icons.js
```
This creates `assets/icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`.
You can replace these with your own PNG icons at any time.

### Step 3 — Build the extension
```bash
npm run build
```
Output is written to the `dist/` folder. This is the packaged extension.

---

## 3. Load in Chrome (Developer Mode)

> No payment, no Web Store account, no review process needed.

1. Open Chrome and go to:
   ```
   chrome://extensions/
   ```

2. Turn on **Developer mode** using the toggle in the **top-right corner**.

3. Click **"Load unpacked"**.

4. Navigate to your `TimeTracker/` folder and select the **`dist`** subfolder.

5. The extension is now installed. You'll see it in your extensions list.

6. **Pin it to the toolbar:**
   Click the puzzle-piece icon (🧩) in Chrome → find "Office Time Tracker" → click the pin icon 📌.

> The extension only needs to be loaded once. It persists across Chrome restarts.
> You only need to reload it after rebuilding the code (Step 6).

---

## 4. How to Use the Extension

Click the extension icon in the Chrome toolbar to open the popup.
The popup has four tabs: **Timer**, **Breaks**, **Stats**, **Settings**.

---

### Timer Tab

The main daily tracking screen.

#### Clocking In
- Click **Clock In** to start your work session.
- The large timer starts counting your worked hours (HH:MM format).
- A progress bar fills toward the **8h 45m daily target**.

#### Taking a Break
- Click **Start Break** when you step away.
- The timer pauses counting work time.
- Click **End Break** to resume. The break is recorded automatically.
- Break duration is shown as `Xm / 45m`. Going over 45m turns the card red.

#### Clocking Out
- Click **Clock Out** to end your session.
- Your full day record is saved to Chrome storage.
- If a **Work Folder** is configured (see Section 5), today's record is also auto-saved as a JSON file.

#### Status Cards

| Card | What it shows |
|---|---|
| **Remaining Work** | How much work time is left to hit 8h 45m. Shows "Done ✓" when complete. |
| **Break Used** | Minutes of break taken vs the 45m allowance. |
| **Late Arrival** | How many minutes after 10:00 AM you clocked in. |
| **Overtime** | How much time beyond 8h 45m you've worked. |

#### Idle Detection
If you have been idle for 5+ minutes while a break is active, a warning banner appears:
`"You appear idle — break timer is still running."`

---

### Breaks Tab — Work Calculator

Use this to **manually check if your 8h 45m target is complete** based on the times you enter.
This is useful when you forgot to click Start/End Break, or want to plan your day.

**Fields:**
- **Clock In** — auto-filled from today's clock record. Editable.
- **Clock Out** — optional. If left blank, the current time is used.
- **Break periods** — add as many as needed. Each has a start and end time.

**How to use:**
1. Go to the **Breaks** tab.
2. Your clock-in time is pre-filled. Adjust if needed.
3. Add your break periods by clicking **+ Add Break**, then enter start/end times (e.g. `13:00` – `13:45`).
4. The result updates instantly:

| Result | What it means |
|---|---|
| Progress bar | % of 8h 45m completed |
| "Xh Ym remaining" | How much work time is still needed |
| **"Leave at HH:MM"** | Exact clock-out time needed to complete 8h 45m |
| **"Target Complete ✓"** | 8h 45m has been reached |
| Overtime shown | Extra time worked beyond the target |

> **Tip:** When you use the Start/End Break buttons in the Timer tab, those breaks are
> automatically synced to the Breaks tab calculator.

---

### Stats Tab — Analytics

View your work patterns over the past week or month.

- **This Week** — bar chart of daily worked hours vs overtime, plus totals for the week.
- **This Month** — pie chart comparing total worked hours vs expected hours, plus monthly totals.
- **Export CSV** — downloads all records for the selected period as a `.csv` file.

---

### Settings Tab

#### Appearance
- Toggle **Dark Mode** on/off. The entire popup switches theme.

#### Office Hours
- Adjust **Start Time** and **End Time** (default: 10:00 AM – 7:30 PM).
- Set **Break allowance** in minutes (default: 45).
- Required daily work is fixed at **8h 45m**.

#### Notifications
- Enable/disable Chrome notification reminders for clock-in, clock-out, and break limits.

#### Work History Folder
See [Section 5](#5-local-folder--work-history) for full details.

#### Data Management
- **Export All as CSV** — exports every recorded entry.
- **Reset All Data** — permanently deletes all tracking data (asks for confirmation).

---

## 5. Local Folder — Work History

The extension saves all data in Chrome's local storage by default.
You can also connect a local folder on your computer to get human-readable JSON files.

### Why use a folder?
- Data survives even if Chrome storage is cleared or the extension is removed.
- Files are plain JSON — readable in any text editor or imported into Excel/Sheets.
- One file per day, named `YYYY-MM-DD.json`.

### Set up the folder

1. Go to **Settings** → **Work History Folder**.
2. Click **"Choose Folder"**.
3. A browser folder picker opens. Navigate to or create a folder (e.g. `Documents/WorkHistory/`).
4. Click **Select Folder** and approve the permission prompt.
5. The folder name appears in green — setup is complete.

> The permission is remembered in IndexedDB. You will not be prompted again unless you
> clear browser data or click the remove icon (🗁).

### Save today's record manually
Click **"Save Today"** in the Settings panel. This writes `YYYY-MM-DD.json` to your folder immediately.

### Auto-save on clock-out
Every time you click **Clock Out**, the day's record is automatically saved to the folder in the background (no action needed).

### File format
Each file contains the full day's record:
```json
{
  "date": "2026-05-12",
  "savedAt": "2026-05-12T19:31:05.000Z",
  "entry": {
    "id": "1747071065000-abc123",
    "date": "2026-05-12",
    "clockInTime": 1747036200000,
    "clockOutTime": 1747069800000,
    "totalBreakDuration": 2700000,
    "breaks": [
      { "start": "13:00", "end": "13:45" }
    ],
    "isLate": false,
    "workedMinutes": 525,
    "overtimeMinutes": 0
  }
}
```

### Import records from folder
If you reinstall the extension or move to a new machine:
1. Choose your existing folder (Steps above).
2. Click **"Import Records"** — all JSON files are scanned and loaded into Chrome storage.
3. Stats and dashboard will now show your full history.

---

## 6. Development Workflow

### Rebuild after code changes
```bash
npm run build
```
Then go to `chrome://extensions/` and click the **↺ refresh icon** on the extension card.

### Auto-rebuild on save
```bash
npm run dev
```
Vite watches for file changes and rebuilds automatically.
You still need to click **↺** in Chrome after each rebuild to pick up the new code.

### Regenerate icons
```bash
node --input-type=module < scripts/generate-icons.js
```

### Build + zip for sharing
```bash
npm run build
```
Then right-click the `dist/` folder → **Send to → Compressed (zipped) folder** on Windows,
or `zip -r dist.zip dist/` on Mac/Linux.

---

## 7. Debugging

### Popup errors
Right-click the popup → **Inspect** → **Console** tab.

### Background service worker errors
Go to `chrome://extensions/` → find the extension → click the **"Service Worker"** link.
This opens a DevTools window for the background script.

### Inspect Chrome storage
In the Service Worker DevTools console:
```javascript
// View all stored data
chrome.storage.local.get(null, console.log)

// Clear all data
chrome.storage.local.clear()

// View only entries
chrome.storage.local.get('office_tracker_data', d => console.log(d.office_tracker_data.entries))
```

### Check IndexedDB (folder handle)
In the popup's DevTools console:
```javascript
// Open the IndexedDB to see if the folder handle is saved
indexedDB.open('TimeTrackerFS', 1)
```

### Force a file save (popup console)
```javascript
// Manually trigger a save to the folder
const { saveDailyRecord } = await import('/assets/storage-*.js') // check filename in dist/assets/
```

---

## 8. Sharing the Extension (no Web Store)

You can share this extension with teammates without publishing it anywhere.

### Option A — Share the source (recommended for developers)
1. Send them this entire `TimeTracker/` folder (or push to a private Git repo).
2. They run:
   ```bash
   npm install
   npm run build
   ```
3. Load `dist/` as unpacked in Chrome.

### Option B — Share the built `dist/` folder
1. Run `npm run build`.
2. Zip the `dist/` folder.
3. Send the `.zip`.
4. Recipient extracts it and loads the extracted folder as unpacked in Chrome.

> Both options are completely free. Chrome Developer Mode works permanently — there is no expiry.

---

## 9. Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `npm install` fails | Node.js not installed | Install from nodejs.org |
| `dist/` folder is missing | Build not run | Run `npm run build` |
| Code changes not reflected | Extension not refreshed | Click ↺ at `chrome://extensions/` |
| Popup opens blank | JS error in React code | Right-click popup → Inspect → Console |
| Timer stuck at 00:00 | Not clocked in | Click Clock In |
| Break calculator shows nothing | Clock In time is empty | Enter a clock-in time in the Breaks tab |
| Folder picker doesn't open | Chrome < 86, or non-secure context | Use Chrome 86+ (standard install) |
| "Choose Folder" button missing | `showDirectoryPicker` not supported | Update Chrome to latest |
| Notifications not appearing | Permission denied | Check `chrome://settings/content/notifications` |
| Data lost after reinstall | Only in Chrome storage | Use Work Folder + Import Records to restore |
| Service worker not running | Extension not reloaded | Click ↺ at `chrome://extensions/` |

---

## 10. Project Structure

```
TimeTracker/
│
├── popup.tsx                   ← Main popup UI (4 tabs: Timer, Breaks, Stats, Settings)
├── popup.html                  ← HTML entry for the popup window
├── manifest.json               ← Chrome Extension Manifest v3
├── vite.config.ts              ← Vite + @crxjs build config
├── tailwind.config.js          ← Tailwind CSS config (darkMode: class)
├── postcss.config.js           ← PostCSS config (Tailwind + Autoprefixer)
├── tsconfig.json               ← TypeScript config (~ alias → project root)
├── package.json                ← npm scripts + dependencies
│
├── src/
│   ├── main.tsx                ← React root (renders Popup into #app)
│   │
│   ├── background/
│   │   └── index.ts            ← Service worker: alarms, notifications, badge updates
│   │
│   ├── components/
│   │   ├── BreakCalculator.tsx ← Manual break entry, 8h45m completion check, clock-out estimator
│   │   ├── Dashboard.tsx       ← Weekly/monthly charts (Recharts), CSV export
│   │   └── Settings.tsx        ← Preferences, Work Folder setup, data management
│   │
│   ├── hooks/
│   │   └── useTimeTracker.ts   ← Live state hook (clock in/out, breaks, idle detection, auto-save)
│   │
│   ├── utils/
│   │   ├── storage.ts          ← chrome.storage.local wrapper (CRUD for entries + settings)
│   │   ├── timeCalculations.ts ← All time math: 8h45m target, break calc, weekly/monthly stats
│   │   ├── fileStorage.ts      ← File System Access API: folder picker, JSON read/write (IndexedDB handle)
│   │   ├── notifications.ts    ← Chrome notifications helper
│   │   ├── csvExport.ts        ← CSV file download utility
│   │   └── idleDetection.ts    ← Mouse/keyboard activity tracker
│   │
│   ├── types/
│   │   └── index.ts            ← TypeScript interfaces (TimeEntry, DailyStats, BreakPeriod, etc.)
│   │
│   └── styles/
│       └── popup.css           ← Tailwind @base / @components / @utilities imports
│
├── assets/
│   ├── icon.png                ← Source icon (128×128, used by Vite)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── scripts/
│   └── generate-icons.js       ← Node.js script to create placeholder PNG icons (no dependencies)
│
└── dist/                       ← Built extension — LOAD THIS FOLDER IN CHROME
    ├── manifest.json
    ├── popup.html
    ├── service-worker-loader.js
    └── assets/
        ├── popup-*.js          ← Bundled React app
        ├── popup-*.css         ← Tailwind CSS
        └── icon*.png
```

---

## Quick Reference

| Task | Command / Action |
|---|---|
| Install dependencies | `npm install` |
| Generate icons | `node --input-type=module < scripts/generate-icons.js` |
| Build extension | `npm run build` |
| Auto-rebuild on save | `npm run dev` |
| Load in Chrome | `chrome://extensions/` → Load unpacked → select `dist/` |
| Reload after rebuild | Click ↺ at `chrome://extensions/` |
| Debug popup | Right-click popup → Inspect |
| Debug background | `chrome://extensions/` → Service Worker link |
| View storage | SW console: `chrome.storage.local.get(null, console.log)` |
| Clear storage | SW console: `chrome.storage.local.clear()` |
| Export data | Settings tab → Export All as CSV |
| Save to folder | Settings tab → Work History Folder → Save Today |

---

*Free to use, free to modify, forever. Developer mode only — no Chrome Web Store required.*
