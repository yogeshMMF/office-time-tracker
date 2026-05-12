export class IdleDetector {
  private idleThreshold: number = 300000; // 5 minutes
  private lastActivity: number = Date.now();
  private isIdleCallback: ((isIdle: boolean) => void) | null = null;
  private isCurrentlyIdle: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(thresholdMs: number = 300000) {
    this.idleThreshold = thresholdMs;
  }

  public start(callback: (isIdle: boolean) => void): void {
    this.isIdleCallback = callback;
    this.setupListeners();
    this.startMonitoring();
  }

  public stop(): void {
    this.removeListeners();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public resetActivity(): void {
    const wasIdle = this.isCurrentlyIdle;
    this.lastActivity = Date.now();
    this.isCurrentlyIdle = false;

    if (wasIdle && this.isIdleCallback) {
      this.isIdleCallback(false);
    }
  }

  public isIdle(): boolean {
    return this.isCurrentlyIdle;
  }

  private setupListeners(): void {
    document.addEventListener("mousemove", () => this.resetActivity());
    document.addEventListener("keydown", () => this.resetActivity());
    document.addEventListener("mousedown", () => this.resetActivity());
    document.addEventListener("keyup", () => this.resetActivity());
    document.addEventListener("scroll", () => this.resetActivity());
    document.addEventListener("touchstart", () => this.resetActivity());
  }

  private removeListeners(): void {
    document.removeEventListener("mousemove", () => this.resetActivity());
    document.removeEventListener("keydown", () => this.resetActivity());
    document.removeEventListener("mousedown", () => this.resetActivity());
    document.removeEventListener("keyup", () => this.resetActivity());
    document.removeEventListener("scroll", () => this.resetActivity());
    document.removeEventListener("touchstart", () => this.resetActivity());
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      const idle = timeSinceLastActivity > this.idleThreshold;

      if (idle !== this.isCurrentlyIdle) {
        this.isCurrentlyIdle = idle;
        if (this.isIdleCallback) {
          this.isIdleCallback(idle);
        }
      }
    }, 10000); // Check every 10 seconds
  }
}
