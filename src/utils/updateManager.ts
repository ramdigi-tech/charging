export class UpdateManager {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastETag: string | null = null;

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
  }
}
