interface ElectronAPI {
  fetch(url: string, init?: { headers?: Record<string, string> }): Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    body: unknown;
  }>;
  toggleAlwaysOnTop(): Promise<boolean>;
  showContextMenu(): void;
  closeWindow(): void;
  getAppVersion(): Promise<string>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
