# Complete File Structure

## Directory Tree

```
TimeTracker/
├── src/
│   ├── background/
│   │   └── index.ts                 # Service worker (alarms, notifications, badge)
│   │
│   ├── components/
│   │   ├── Dashboard.tsx            # Analytics page with charts (Recharts)
│   │   └── Settings.tsx             # Settings page (preferences, export, reset)
│   │
│   ├── hooks/
│   │   └── useTimeTracker.ts        # Main state management hook
│   │
│   ├── styles/
│   │   └── popup.css                # Tailwind imports + custom styles
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces & type definitions
│   │
│   ├── utils/
│   │   ├── csvExport.ts             # CSV export functionality
│   │   ├── idleDetection.ts         # Idle activity detection class
│   │   ├── notifications.ts         # Chrome notifications API wrapper
│   │   ├── storage.ts               # Chrome storage API wrapper
│   │   └── timeCalculations.ts      # Time math & statistics
│   │
│   ├── index.html                   # Popup HTML entry point
│   ├── index.tsx                    # React entry point
│   └── popup.tsx                    # Main popup component
│
├── assets/
│   ├── icon-16.png                  # 16x16 extension icon (create manually)
│   ├── icon-32.png                  # 32x32 extension icon
│   ├── icon-48.png                  # 48x48 extension icon
│   └── icon-128.png                 # 128x128 extension icon
│
├── .gitignore                       # Git ignore rules
├── ARCHITECTURE.md                  # Deep dive into code structure
├── DEPLOYMENT.md                    # Chrome Web Store publishing guide
├── QUICKSTART.md                    # 5-minute setup guide
├── FILE_STRUCTURE.md                # This file
├── README.md                        # Full documentation
├── package.json                     # Dependencies & scripts
├── plasmo.json                      # Plasmo configuration
├── postcss.config.js                # PostCSS for Tailwind
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Example environment variables
└── .env                             # Local environment (gitignored)
```

## File Descriptions

### Source Files

#### Core App Files
- **`src/index.tsx`** (10 lines)
  - React entry point
  - Mounts Popup component to #app div

- **`src/index.html`** (6 lines)
  - HTML container for React
  - Single `<div id="app"></div>`

- **`src/popup.tsx`** (200 lines)
  - Main popup component
  - Manages tab navigation (Timer/Dashboard/Settings)
  - Status display with auto-updating timer
  - Action buttons (Clock In/Out, Start/End Break)
  - Idle warning display
  - Responsive layout (w-96)

#### Components
- **`src/components/Dashboard.tsx`** (150 lines)
  - Weekly and monthly view toggle
  - Summary cards (Total Worked, Overtime, Break, Avg)
  - Interactive Recharts (BarChart for weekly, PieChart for monthly)
  - CSV export button
  - Real-time data loading

- **`src/components/Settings.tsx`** (180 lines)
  - Dark mode toggle
  - Office hours time inputs
  - Break duration number input
  - Notification preferences
  - CSV export button
  - Reset all data button
  - Version info & links

#### Hooks
- **`src/hooks/useTimeTracker.ts`** (120 lines)
  - Main state management hook
  - Loads today's entry from storage
  - Manages clock in/out/break actions
  - Updates stats every second (real-time timer)
  - Handles idle detection with warnings
  - Exports statistics for UI consumption

#### Utilities
- **`src/utils/storage.ts`** (100 lines)
  - Wraps Chrome storage API
  - CRUD operations for time entries
  - Settings management
  - Default values
  - Promise-based interface

- **`src/utils/timeCalculations.ts`** (300 lines)
  - 20+ calculation functions
  - Time unit conversions
  - Daily/weekly/monthly statistics
  - Late arrival, overtime, remaining time
  - Pure functions (no side effects)
  - Date range helpers

- **`src/utils/csvExport.ts`** (80 lines)
  - Export daily entries as CSV
  - Weekly summary export
  - Monthly summary export
  - Creates Blob and triggers download

- **`src/utils/notifications.ts`** (90 lines)
  - Chrome Notification API wrapper
  - 4 notification types (info/success/warning/error)
  - Pre-configured messages
  - Permission request handling
  - Click handlers

- **`src/utils/idleDetection.ts`** (100 lines)
  - Idle detection class
  - Event listeners (mousemove, keydown, scroll, etc.)
  - Configurable threshold (default 5 min)
  - Callback on state change
  - Start/stop methods

#### Type Definitions
- **`src/types/index.ts`** (50 lines)
  - `TimeEntry`: Single day's record
  - `DailyStats`: Calculated statistics
  - `WeeklyStats`: 7-day aggregation
  - `MonthlyStats`: Month aggregation
  - `TrackerState`: UI state
  - `StorageData`: Full storage structure

#### Background Worker
- **`src/background/index.ts`** (100 lines)
  - Service worker initialization
  - Alarm creation & handling
  - Extension badge updates
  - Message passing from popup
  - Notification triggering

#### Styles
- **`src/styles/popup.css`** (60 lines)
  - Tailwind imports
  - Custom scrollbar styling
  - Animation definitions
  - Focus/accessibility styles
  - Dark mode utilities

### Configuration Files

- **`package.json`** (45 lines)
  - npm dependencies (React, Plasmo, Tailwind, etc.)
  - Scripts (dev, build, build:zip, package)
  - Metadata (name, version, author)
  - Chrome manifest configuration

- **`plasmo.json`** (20 lines)
  - Extension metadata
  - Manifest v3 configuration
  - Background service worker path
  - Icon references

- **`tsconfig.json`** (25 lines)
  - ES2020 target
  - React JSX support
  - Strict mode enabled
  - Path aliases (~/* → ./)

- **`tailwind.config.js`** (40 lines)
  - Custom color palette
  - Dark mode (class-based)
  - Extended theme
  - No plugins (keep it lean)

- **`postcss.config.js`** (5 lines)
  - Tailwind + Autoprefixer

- **.gitignore** (25 lines)
  - node_modules, build, dist
  - IDE settings, OS files
  - Environment files

### Documentation

- **`README.md`** (400 lines)
  - Feature overview
  - Installation & setup
  - Configuration options
  - Usage guide
  - API reference
  - Chrome Web Store submission
  - Troubleshooting

- **`QUICKSTART.md`** (150 lines)
  - 5-minute setup
  - Common commands
  - File change workflow
  - First code changes
  - Debug tips
  - Next steps

- **`DEPLOYMENT.md`** (450 lines)
  - Pre-deployment checklist
  - Build process
  - Chrome Web Store submission
  - Privacy policy template
  - Post-approval management
  - Version updates
  - Troubleshooting

- **`ARCHITECTURE.md`** (500 lines)
  - Design principles
  - System architecture diagram
  - Data flow sequences
  - Component structure
  - State management
  - Type system
  - Time calculations
  - Storage architecture
  - Performance optimization
  - Security considerations
  - Testing strategy
  - Database schema (if expanding)

- **`FILE_STRUCTURE.md`** (This file)
  - Directory tree
  - File descriptions
  - Line count estimates
  - Component map

### Environment

- **`.env.example`** (10 lines)
  - Template for environment variables
  - Office hours, break duration
  - Idle threshold, notifications flag

## Code Statistics

### Total Lines of Code

```
Source Code:
  Components:        350 lines
  Hooks:             120 lines
  Utilities:         670 lines
  Type Definitions:   50 lines
  Styles:             60 lines
  Background:        100 lines
  Entry Points:       16 lines
  ─────────────────────────
  TOTAL:           1,366 lines

Configuration:        90 lines
Documentation:     1,500 lines

Project Total:    2,956 lines
```

### Dependencies

```
Production (12):
  - react
  - react-dom
  - recharts
  - lucide-react
  - date-fns
  - plasmo
  - tailwindcss
  - autoprefixer
  - postcss
  - @types/chrome
  - @types/react
  - typescript

(All included in package.json)
```

## File Sizes (Estimated)

```
src/
  popup.tsx                      ~6 KB
  index.tsx                      ~1 KB
  index.html                     <1 KB
  
  components/
    Dashboard.tsx                ~5 KB
    Settings.tsx                 ~6 KB
  
  hooks/
    useTimeTracker.ts            ~4 KB
  
  utils/
    storage.ts                   ~3 KB
    timeCalculations.ts          ~9 KB
    csvExport.ts                 ~2 KB
    notifications.ts             ~3 KB
    idleDetection.ts             ~3 KB
  
  types/
    index.ts                     ~2 KB
  
  styles/
    popup.css                    ~1 KB
  
  background/
    index.ts                     ~4 KB
  
─────────────────────────────────
Total Source:                   ~50 KB
Gzipped:                         ~15 KB

Build Output (production):      ~150 KB
Gzipped Build:                   ~45 KB
```

## Extension Manifest

The `plasmo.json` generates a Chrome Manifest v3 like this:

```json
{
  "manifest_version": 3,
  "name": "Office Time Tracker",
  "version": "1.0.0",
  "description": "...",
  "permissions": ["storage", "alarms", "notifications"],
  "host_permissions": ["https://*/*", "http://*/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icons": {
      "16": "assets/icon-16.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "assets/icon-16.png",
    "32": "assets/icon-32.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

## How Files Connect

```
user opens extension
        ↓
popup.html loads
        ↓
index.tsx mounts React
        ↓
<Popup> component renders
        ↓
useTimeTracker hook loads data
        ├─→ storage.ts getStorageData()
        │   ├─→ chrome.storage.local.get()
        │   └─→ returns TimeEntry[], settings
        │
        └─→ timeCalculations.ts calculateDailyStats()
            ├─→ takes today's TimeEntry
            └─→ returns DailyStats
        ↓
UI displays stats:
├─→ <TimerView> with real-time timer
├─→ Action buttons (Clock In/Out, Break)
├─→ Status cards with calculated values
└─→ Navigation to Dashboard or Settings
        ↓
user clicks "Clock In"
        ↓
popup.tsx handleClockIn()
        ↓
useTimeTracker.clockIn()
        ├─→ Creates TimeEntry object
        ├─→ calls storage.addTimeEntry()
        │   └─→ chrome.storage.local.set()
        ├─→ NotificationManager.showSuccess()
        └─→ Updates React state
        ↓
chrome.storage.onChanged fires
        ↓
background/index.ts detects change
        ├─→ Updates extension badge to "ON"
        ├─→ Sets badge color to green
        └─→ Triggers notification (if enabled)
        ↓
UI updates in real-time
```

## Adding a New Feature

Example: Add "Pause Work" button

1. Add to `types/index.ts`:
   ```typescript
   interface TimeEntry {
     // ... existing
     pauseStartTime: number | null;
     pauseDuration: number;
   }
   ```

2. Add calculation in `utils/timeCalculations.ts`:
   ```typescript
   export function calculatePausedMinutes(entry): number {
     // ...
   }
   ```

3. Add action in `hooks/useTimeTracker.ts`:
   ```typescript
   const pauseWork = useCallback(async () => {
     // ...
   }, [entry]);
   ```

4. Add button in `src/popup.tsx`:
   ```typescript
   <button onClick={handlePauseWork}>Pause Work</button>
   ```

5. Update Dashboard if needed in `components/Dashboard.tsx`

Done! All data automatically persists.

## File Modification Frequency

When developing:
- **Frequent**: `popup.tsx`, `useTimeTracker.ts`, components
- **Occasional**: utility functions, calculations
- **Rarely**: types, storage API, configuration
- **Never**: package.json (until prod release)

## Learning Path

1. Read `QUICKSTART.md` (5 min)
2. Understand `ARCHITECTURE.md` (20 min)
3. Read `src/popup.tsx` (10 min)
4. Read `src/hooks/useTimeTracker.ts` (5 min)
5. Read `src/utils/timeCalculations.ts` (10 min)
6. Explore other files as needed

**Total: ~50 minutes to full understanding**

---

**This structure follows production-level patterns while remaining simple enough for a solo project.**
