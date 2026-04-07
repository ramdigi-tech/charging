const CURRENT_VERSION = '2.62';

export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
}> {
  try {
    const response = await fetch(window.location.href, {
      cache: 'no-store'
    });
    const html = await response.text();

    const versionMatch = html.match(/Version\s+([\d.]+)/);
    const latestVersion = versionMatch ? versionMatch[1] : CURRENT_VERSION;

    const hasUpdate = compareVersions(latestVersion, CURRENT_VERSION) > 0;

    return {
      hasUpdate,
      latestVersion: hasUpdate ? latestVersion : undefined
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { hasUpdate: false };
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}
