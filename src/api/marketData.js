// Networking layer. Turns a ticker into an array of Candles (and fundamental
// data). Knows nothing about the UI or the profile math.

const API_KEY = import.meta.env.VITE_MARKET_API_KEY
const BASE_URL = 'https://www.alphavantage.co/query'

/** Error with a stable `code` the UI can branch on. */
export class MarketDataError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'MarketDataError'
    this.code = code // 'missing-key' | 'invalid-symbol' | 'rate-limited' | 'no-data' | 'network'
  }
}

/**
 * Fetch daily OHLCV candles for a US ticker via Alpha Vantage.
 *
 * Note on providers: Finnhub's /stock/candle endpoint now requires a paid plan,
 * so Alpha Vantage's free daily endpoint is the more reliable default. To swap
 * in Finnhub, implement the same return shape against /stock/candle?resolution=D.
 *
 * @param {string} symbol
 * @returns {Promise<import('../lib/volumeProfile').Candle[]>}
 */
export async function fetchDailyCandles(symbol) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new MarketDataError(
      'missing-key',
      'Add VITE_MARKET_API_KEY to your .env file to fetch data.',
    )
  }

  const cleaned = symbol.trim().toUpperCase()
  if (!cleaned || !/^[A-Z.\-]{1,8}$/.test(cleaned)) {
    throw new MarketDataError('invalid-symbol', 'Enter a valid US ticker (e.g. AAPL).')
  }

  const url =
    `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(cleaned)}` +
    `&outputsize=compact&apikey=${API_KEY}`

  let res
  try {
    res = await fetch(url)
  } catch (e) {
    throw new MarketDataError('network', e.message || 'Network request failed.')
  }

  if (res.status === 429) {
    throw new MarketDataError('rate-limited', 'API rate limit reached. Try again shortly.')
  }
  if (!res.ok) {
    throw new MarketDataError('network', `Request failed (HTTP ${res.status}).`)
  }

  const json = await res.json()
  return parseDailySeries(json, cleaned)
}

/**
 * Fetch the last 3 years of annual cash flow data for a ticker via Alpha Vantage.
 *
 * Returns an array of up to 3 entries (newest first):
 *   { year: number, operatingCashFlow: number, capEx: number, freeCashFlow: number }
 *
 * Throws MarketDataError on API problems. Returns [] (not throws) when the
 * symbol has no cash flow data (e.g., ETFs).
 *
 * @param {string} symbol
 * @returns {Promise<Array<{year:number, operatingCashFlow:number, capEx:number, freeCashFlow:number}>>}
 */
export async function fetchCashFlow(symbol) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new MarketDataError('missing-key', 'Add VITE_MARKET_API_KEY to your .env file.')
  }

  const cleaned = symbol.trim().toUpperCase()
  const url =
    `${BASE_URL}?function=CASH_FLOW&symbol=${encodeURIComponent(cleaned)}&apikey=${API_KEY}`

  let res
  try {
    res = await fetch(url)
  } catch (e) {
    throw new MarketDataError('network', e.message || 'Network request failed.')
  }

  if (res.status === 429) {
    throw new MarketDataError('rate-limited', 'API rate limit reached. Try again shortly.')
  }
  if (!res.ok) {
    throw new MarketDataError('network', `Request failed (HTTP ${res.status}).`)
  }

  const json = await res.json()

  if (json.Note || json.Information) {
    throw new MarketDataError('rate-limited', 'API rate limit reached. Try again shortly.')
  }

  const reports = json.annualReports
  if (!Array.isArray(reports) || reports.length === 0) return []

  return reports
    .slice(0, 3)
    .map((r) => {
      const ocf = Number(r.operatingCashflow)
      const capex = Math.abs(Number(r.capitalExpenditures))
      const fcf = Number.isFinite(ocf) && Number.isFinite(capex) ? ocf - capex : ocf
      return {
        year: new Date(r.fiscalDateEnding).getFullYear(),
        operatingCashFlow: Number.isFinite(ocf) ? ocf : null,
        capEx: Number.isFinite(capex) ? capex : null,
        freeCashFlow: Number.isFinite(fcf) ? fcf : null,
      }
    })
    .filter((r) => r.freeCashFlow !== null)
    .reverse() // oldest → newest for chart left-to-right
}

/** Decode Alpha Vantage's TIME_SERIES_DAILY payload into sorted candles. */
export function parseDailySeries(json, symbol) {
  // Alpha Vantage signals problems in the body, not via HTTP status.
  if (json.Note || json.Information) {
    throw new MarketDataError('rate-limited', 'API rate limit reached. Try again shortly.')
  }
  if (json['Error Message']) {
    throw new MarketDataError('invalid-symbol', `Couldn't find ticker "${symbol}".`)
  }

  const series = json['Time Series (Daily)']
  if (!series) {
    throw new MarketDataError('no-data', 'No price data returned for this symbol.')
  }

  const candles = Object.entries(series)
    .map(([date, v]) => ({
      date,
      open: Number(v['1. open']),
      high: Number(v['2. high']),
      low: Number(v['3. low']),
      close: Number(v['4. close']),
      volume: Number(v['5. volume']),
    }))
    .filter((c) => Number.isFinite(c.close) && Number.isFinite(c.volume))
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // oldest → newest

  if (candles.length === 0) {
    throw new MarketDataError('no-data', 'No price data returned for this symbol.')
  }
  return candles
}
