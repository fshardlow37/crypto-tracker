# Crypto Tracker

Compact desktop widget for tracking BTC, SPX, FTSE, ZEC prices.

## Stack
- React 19 + TypeScript + Vite + Electron
- lightweight-charts v5.1.0 (TradingView)

## Key Constraints
- Window defaults: 320x300, position saved to `AppData/Roaming/Crypto Tracker/window-state.json`
- Theme: GitHub Dark palette via semantic CSS vars in `src/styles/variables.css`
- No text-shadow glows, no box-shadow glows, no neon effects — clean flat style
- Font: Inter (primary), Cascadia Code (mono)
