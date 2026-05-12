import { getSettings, getTodayEntry } from "~/src/utils/storage";
import { timeToMinutes } from "~/src/utils/timeCalculations";

// -- Badge helpers --

async function refreshBadge() {
  try {
    const entry = await getTodayEntry();
    if (entry?.breakStartTime && !entry.breakEndTime) {
      chrome.action.setBadgeText({ text: "BRK" });
      chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
    } else if (entry?.clockInTime && !entry.clockOutTime) {
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  } catch {
    // Storage may not be ready yet on first install
  }
}

// -- Notification helper (service worker context) --

function notify(title: string, message: string) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon-48.png",
    title,
    message,
    priority: 1,
  });
}

// -- Alarm setup --

function setupAlarms() {
  chrome.alarms.create("break-check", { periodInMinutes: 1 });
  chrome.alarms.create("time-check", { periodInMinutes: 5 });
}

// -- Event listeners --

chrome.runtime.onInstalled.addListener(() => {
  setupAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarms();
  refreshBadge();
});

chrome.storage.onChanged.addListener(() => {
  refreshBadge();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    const settings = await getSettings();
    const nowMins = timeToMinutes();

    if (alarm.name === "time-check") {
      // Clock-in reminder (10 min window around office start)
      if (Math.abs(nowMins - settings.officeStartTime) < 5) {
        const entry = await getTodayEntry();
        if (!entry?.clockInTime) {
          notify("Office Time", "Don't forget to clock in!");
        }
      }

      // Clock-out reminder (10 min window around office end)
      if (Math.abs(nowMins - settings.officeEndTime) < 5) {
        const entry = await getTodayEntry();
        if (entry?.clockInTime && !entry.clockOutTime) {
          notify("Office Time", "Time to clock out! Have a great evening.");
        }
      }
    }

    if (alarm.name === "break-check") {
      const entry = await getTodayEntry();
      if (entry?.breakStartTime && !entry.breakEndTime) {
        const breakMins = Math.floor((Date.now() - entry.breakStartTime) / 60000);
        // Warn at 5 minutes before limit
        if (breakMins === settings.allowedBreakMinutes - 5) {
          notify("Break Time", `5 minutes left of your ${settings.allowedBreakMinutes}m break.`);
        }
        // Warn when exceeded
        if (breakMins === settings.allowedBreakMinutes) {
          notify("Break Exceeded", "You have used your full break allowance.");
        }
      }
    }
  } catch {
    // Silently ignore — storage may be unavailable
  }
});

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.action === "getStatus") {
    getTodayEntry().then((entry) => sendResponse({ entry }));
    return true; // keep channel open for async response
  }
});
