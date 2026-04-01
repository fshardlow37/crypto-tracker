import { app, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const stateFile = path.join(app.getPath('userData'), 'window-state.json');

const DEFAULTS: WindowBounds = { x: 100, y: 100, width: 320, height: 300 };

function boundsAreVisible(bounds: WindowBounds): boolean {
  const displays = screen.getAllDisplays();
  return displays.some((display) => {
    const { x, y, width, height } = display.workArea;
    return (
      bounds.x < x + width &&
      bounds.x + bounds.width > x &&
      bounds.y < y + height &&
      bounds.y + bounds.height > y
    );
  });
}

export function loadWindowState(): WindowBounds {
  try {
    const data = fs.readFileSync(stateFile, 'utf-8');
    const bounds: WindowBounds = JSON.parse(data);
    if (boundsAreVisible(bounds)) {
      return bounds;
    }
  } catch {
    // File doesn't exist or is invalid — use defaults
  }
  return DEFAULTS;
}

export function saveWindowState(bounds: WindowBounds): void {
  try {
    fs.writeFileSync(stateFile, JSON.stringify(bounds), 'utf-8');
  } catch {
    // Silently ignore write errors
  }
}
