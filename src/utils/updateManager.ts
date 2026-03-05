export class UpdateManager {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastETag: string | null = null;
  private isTabActive: boolean = true;
  private handleVisibilityChange: () => void;
  private handleFocus: () => void;
  private handleBlur: () => void;

  constructor(checkIntervalMs: number = 30000) {
    this.handleVisibilityChange = () => {
      this.isTabActive = !document.hidden;
    };

    this.handleFocus = () => {
      this.isTabActive = true;
    };

    this.handleBlur = () => {
      this.isTabActive = false;
    };

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);

    this.checkInterval = setInterval(() => this.checkForUpdates(), checkIntervalMs);
  }

  private async checkForUpdates() {
    if (!this.isTabActive) {
      return;
    }

    try {
      const response = await fetch('/index.html', { cache: 'no-store' });
      const eTag = response.headers.get('etag') || response.headers.get('last-modified');
      const contentLength = response.headers.get('content-length');

      const currentFingerprint = `${eTag}-${contentLength}`;

      if (this.lastETag === null) {
        this.lastETag = currentFingerprint;
      } else if (this.lastETag !== currentFingerprint) {
        console.log('[UpdateManager] New version detected, auto-reloading...');
        this.applyUpdate();
      }
    } catch (error) {
      console.error('[UpdateManager] Error checking for updates:', error);
    }
  }

  async applyUpdate() {
    console.log('[UpdateManager] Applying update...');

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    window.location.reload();
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
  }
}
