import { app, BrowserWindow, ipcMain, Menu, session } from 'electron';
import * as path from 'path';
import { loadWindowState, saveWindowState } from './windowState';

const isDev = !!process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const bounds = loadWindowState();

  if (isDev) {
    // In dev mode, strip CSP headers so Vite HMR (which uses eval) works
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const headers = { ...details.responseHeaders };
      delete headers['content-security-policy'];
      delete headers['Content-Security-Policy'];
      callback({ responseHeaders: headers });
    });
  } else {
    // Production CSP
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'",
          ],
        },
      });
    });
  }

  mainWindow = new BrowserWindow({
    ...bounds,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
    },
  });

  // Dev or production
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Save window position/size on move and resize
  const saveBounds = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState(mainWindow.getBounds());
    }
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Proxy fetch requests from renderer (bypasses CORS)
const ALLOWED_HOSTS = new Set([
  'api.coingecko.com',
  'query1.finance.yahoo.com',
  'bitcoin-data.com',
]);

ipcMain.handle(
  'proxy-fetch',
  async (_event, url: string, init?: { headers?: Record<string, string> }) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }

    if (parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS requests are allowed');
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      throw new Error(`Blocked request to disallowed host: ${parsed.hostname}`);
    }

    try {
      const res = await fetch(url, {
        headers: init?.headers,
      });
      const body = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        body,
      };
    } catch (err) {
      throw err;
    }
  }
);

// IPC: Close window
ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// IPC: App version
ipcMain.handle('get-app-version', () => app.getVersion());

// IPC: Toggle always-on-top
ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const current = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!current);
    return !current;
  }
  return false;
});

// IPC: Context menu
ipcMain.on('show-context-menu', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const isOnTop = mainWindow.isAlwaysOnTop();
  const loginSettings = app.getLoginItemSettings();
  const menu = Menu.buildFromTemplate([
    {
      label: isOnTop ? 'Disable Always on Top' : 'Enable Always on Top',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setAlwaysOnTop(!isOnTop);
        }
      },
    },
    {
      label: loginSettings.openAtLogin ? 'Disable Start on Login' : 'Enable Start on Login',
      click: () => {
        app.setLoginItemSettings({
          openAtLogin: !loginSettings.openAtLogin,
          name: 'Crypto Tracker',
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Reload',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  menu.popup({ window: mainWindow });
});

// Auto-launch at startup (enabled by default)
app.setLoginItemSettings({
  openAtLogin: true,
  name: 'Crypto Tracker',
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
