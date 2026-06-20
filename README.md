# 📊 Stocks Volume Profile

A clean, minimalist single-page web app for analyzing the **volume profile** of US stocks — helping investors spot **high-volume nodes** and **key entry zones** (support/resistance) based on where trading volume has concentrated.

Built with **React + Vite**, **Tailwind CSS**, and **Recharts**.

![Tech](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)

---

## ✨ Features

- **Ticker search** — type any US ticker (AAPL, TSLA, NVDA…) and analyze instantly.
- **Volume Profile chart** — historical price grouped into horizontal price bins, with each bin's total volume drawn as a horizontal bar.
- **Point of Control (POC)** — the price level with the most traded volume, clearly highlighted.
- **Value Area (70%)** — the price range where ~70% of volume traded, shaded distinctly.
- **Insight card** — *"Key Entry Zone / High Volume Node detected at $X"*, plus how the current price relates to the value area.
- **Adjustable lookback** — 30 / 60 / 90 day windows.
- **Graceful errors** — invalid ticker, rate limits, and missing API key are all handled.

---

## 🧠 How the volume profile is calculated

1. Pull the last *N* trading days of daily OHLCV data.
2. Split the price range (min low → max high) into horizontal **bins**.
3. For each day, spread its volume across the bins its high–low range overlaps, **proportional to the overlap** — more faithful than assigning a day's whole volume to one price.
4. The bin with the highest volume is the **Point of Control (POC)**.
5. The **Value Area** grows outward from the POC until it captures 70% of total volume.

All of this lives in [`src/lib/volumeProfile.js`](src/lib/volumeProfile.js) as pure, framework-agnostic functions.

---

## 🚀 Getting started

### 1. Clone & install

```bash
git clone https://github.com/salharb1/stocks-volume-profile.git
cd stocks-volume-profile
npm install
```

### 2. Add your API key

Get a **free** Alpha Vantage key (takes 10 seconds): https://www.alphavantage.co/support/#api-key

Copy the example env file and paste your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
VITE_MARKET_API_KEY=your_real_key_here
```

> **Note:** Vite only exposes variables prefixed with `VITE_` to the browser. Restart the dev server after editing `.env`. Never commit your real key — `.env` is gitignored.

### 3. Run

```bash
npm run dev
```

Open the printed `http://localhost:5173`, search a ticker, and hit **Analyze**.

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project structure

```
stocks-volume-profile/
├─ index.html
├─ .env.example              # copy → .env, add your key
├─ src/
│  ├─ main.jsx               # React entry
│  ├─ App.jsx                # layout & state wiring
│  ├─ api/
│  │  └─ marketData.js       # Alpha Vantage fetch + response decoding
│  ├─ lib/
│  │  └─ volumeProfile.js    # pure profile math (POC, value area, formatters)
│  ├─ hooks/
│  │  └─ useVolumeProfile.js # fetch → calculate → state orchestration
│  └─ components/
│     ├─ SearchBar.jsx
│     ├─ SummaryCard.jsx
│     ├─ VolumeProfileChart.jsx
│     └─ StateViews.jsx      # loading / empty / error states
└─ ...config (vite, tailwind, postcss)
```

The separation is deliberate: **networking** (`api/`), **business logic** (`lib/`), and **UI** (`components/`) don't bleed into each other, so any piece can be tested or swapped independently.

---

## 🔌 Switching data providers

The app uses Alpha Vantage's free `TIME_SERIES_DAILY` endpoint by default, because Finnhub's `/stock/candle` endpoint now requires a paid plan for most US equities.

To use a different provider, reimplement `fetchDailyCandles()` in [`src/api/marketData.js`](src/api/marketData.js) so it returns the same array shape:

```js
[{ date, open, high, low, close, volume }, ...] // oldest → newest
```

Nothing else needs to change.

### Free-tier limits

Alpha Vantage's free tier allows **25 requests/day** and **5/minute**. The app detects the rate-limit response and surfaces a friendly message.

---

## ⚠️ Disclaimer

This is an **educational tool**, not investment advice. Always do your own research.

## 📄 License

MIT
