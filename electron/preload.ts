import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  fetch: (url: string, init?: { headers?: Record<string, string> }) =>
    ipcRenderer.invoke('proxy-fetch', url, init),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  closeWindow: () => ipcRenderer.send('close-window'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
