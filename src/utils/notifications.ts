export interface NotificationOptions {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number; // in ms, 0 = persistent
}

export class NotificationManager {
  private static isSupported(): boolean {
    return "Notification" in window;
  }

  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  public static async show(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.log("[Notification]", options.title, options.message);
      return;
    }

    if (Notification.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(options.title, {
      body: options.message,
      icon: chrome.runtime.getURL("assets/icon-128.png"),
      tag: options.type,
      requireInteraction: options.type === "warning" || options.type === "error",
    });

    if (options.duration && options.duration > 0) {
      setTimeout(() => notification.close(), options.duration);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  public static showClockInReminder(): Promise<void> {
    return this.show({
      title: "Office Time",
      message: "Good morning! Don't forget to clock in.",
      type: "info",
      duration: 5000,
    });
  }

  public static showClockOutReminder(): Promise<void> {
    return this.show({
      title: "Office Time",
      message: "It's 7:30 PM. Time to clock out!",
      type: "info",
      duration: 5000,
    });
  }

  public static showBreakReminderStart(): Promise<void> {
    return this.show({
      title: "Break Time",
      message: "Start your break to track it properly.",
      type: "info",
      duration: 5000,
    });
  }

  public static showBreakReminderEnd(): Promise<void> {
    return this.show({
      title: "Break Time",
      message: "Your break is about to end.",
      type: "warning",
      duration: 5000,
    });
  }

  public static showSuccess(title: string, message: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "success",
      duration: 3000,
    });
  }

  public static showError(title: string, message: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "error",
      duration: 0,
    });
  }

  public static showWarning(title: string, message: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "warning",
      duration: 5000,
    });
  }

  public static showIdleWarning(): Promise<void> {
    return this.show({
      title: "Idle Detected",
      message: "You seem to be inactive. Your break timer is still running.",
      type: "warning",
      duration: 5000,
    });
  }
}
