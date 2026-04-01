# Crypto Tracker

A compact, always-on-top desktop widget for monitoring cryptocurrency prices, stock indices and commodities in real time. Built with Electron, React and TradingView's lightweight-charts.

![Windows](https://img.shields.io/badge/platform-Windows-blue)
![Electron](https://img.shields.io/badge/electron-41-47848f)
![React](https://img.shields.io/badge/react-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Live prices** for 9 assets across crypto, indices and commodities
- **Interactive charts** powered by TradingView lightweight-charts with 1D / 1W / 1M / 3M / 1Y / ALL time ranges
- **On-chain indicators** for Bitcoin: Mayer Multiple, Puell Multiple, NUPL, NVT Signal, MVRV Z-Score
- **List view** with sparklines and 24h / 7d / 30d change columns
- **Detail view** with full chart, indicator overlays and coin switcher
- **Always-on-top** frameless widget that stays visible while you work
- **Starts on login** automatically (configurable via right-click menu)
- **Window position saved** between sessions
- **Dark theme** using the GitHub Dark colour palette

### Tracked Assets

| Asset | Symbol | Source |
|-------|--------|--------|
| Bitcoin | BTC | CoinGecko |
| Zcash | ZEC | CoinGecko |
| Crude Oil | USOIL | Yahoo Finance |
| S&P 500 | SPX | Yahoo Finance |
| NASDAQ-100 | NDX | Yahoo Finance |
| CSI 300 | CSI | Yahoo Finance |
| Nikkei 225 | N225 | Yahoo Finance |
| Euronext 100 | N100 | Yahoo Finance |
| FTSE 100 | FTSE | Yahoo Finance |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm

### Install

```bash
git clone https://github.com/fshardlow37/crypto-tracker.git
cd crypto-tracker
npm install
```

### Configure (optional)

Copy the example env file and add a free CoinGecko API key for higher rate limits:

```bash
cp .env.example .env
```

```env
VITE_COINGECKO_API_KEY=your_key_here
```

A key is optional -- the app works without one but may hit rate limits under heavy use. Get a free demo key at [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing).

### Development

```bash
npm run dev:electron
```

Starts Vite dev server + Electron with hot reload.

### Build

```bash
npm run build:electron
```

Outputs a portable exe to `release/win-unpacked/Crypto Tracker.exe`.

## Usage

- **Click** a row in list view to open its detail chart
- **Right-click** anywhere for options: always-on-top toggle, start-on-login toggle, reload, quit
- **Drag** the titlebar to move the window
- **Resize** by dragging window edges -- position and size are saved automatically

## Tech Stack

- **Electron 41** -- desktop shell with sandboxed renderer
- **React 19** -- UI components
- **TypeScript 5.9** -- type safety throughout
- **Vite 8** -- build tooling and HMR
- **lightweight-charts 5.1** -- TradingView charting library
- **Inter + Cascadia Code** -- display and monospace fonts

## Security

- Frameless window with `contextIsolation`, `sandbox`, and `nodeIntegration: false`
- IPC fetch proxy restricted to a whitelist of HTTPS-only API domains
- Content Security Policy enforced in production
- Minimal preload API surface (3 methods exposed via `contextBridge`)

## License

[MIT](LICENSE)
