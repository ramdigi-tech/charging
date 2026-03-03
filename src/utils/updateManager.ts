export class UpdateManager {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastETag: string | null = null;
  private onUpdateAvailable: (() => void) | null = null;

  constructor(checkIntervalMs: number = 30000) {
    this.checkInterval = setInterval(() => this.checkForUpdates(), checkIntervalMs);
  }

  private async checkForUpdates() {
    try {
      const response = await fetch('/index.html', { cache: 'no-store' });
      const eTag = response.headers.get('etag') || response.headers.get('last-modified');
      const contentLength = response.headers.get('content-length');

      const currentFingerprint = `${eTag}-${contentLength}`;

      if (this.lastETag === null) {
        this.lastETag = currentFingerprint;
      } else if (this.lastETag !== currentFingerprint) {
        console.log('[UpdateManager] New version detected');
        this.lastETag = currentFingerprint;
        if (this.onUpdateAvailable) {
          this.onUpdateAvailable();
        }
      }
    } catch (error) {
      console.error('[UpdateManager] Error checking for updates:', error);
    }
  }

  setUpdateCallback(callback: () => void) {
    this.onUpdateAvailable = callback;
  }

  async applyUpdate() {
    console.log('[UpdateManager] Applying update...');
    const clients = await navigator.serviceWorker.matchAll();

    for (const client of clients) {
      client.postMessage({ type: 'SKIP_WAITING' });
    }

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
  }
}
