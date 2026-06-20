// Pure volume-profile math. No React, no network — easy to reason about and test.

/**
 * @typedef {Object} Candle
 * @property {string} date  ISO date (yyyy-mm-dd)
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 * @property {number} volume
 */

/**
 * @typedef {Object} Bin
 * @property {number} lower    bucket low price
 * @property {number} upper    bucket high price
 * @property {number} mid      bucket midpoint
 * @property {number} volume   total volume in the bucket
 */

/**
 * Build a volume profile from daily candles.
 *
 * Each day's volume is spread across the price bins its high–low range overlaps,
 * proportional to the overlap. This is more faithful than dumping a day's whole
 * volume at a single price, especially for wide-range days.
 *
 * @param {Candle[]} candles  chronological (oldest → newest) daily bars
 * @param {Object}  [opts]
 * @param {number}  [opts.lookback=60]          recent trading days to include
 * @param {number}  [opts.binCount=24]          number of price buckets
 * @param {number}  [opts.valueAreaPercent=0.7] share of volume defining the value area
 * @returns {null | {
 *   bins: Bin[], poc: Bin, valueAreaLow: number, valueAreaHigh: number,
 *   lastClose: number, periodDays: number, maxBinVolume: number,
 *   priceLow: number, priceHigh: number, totalVolume: number
 * }}
 */
export function buildVolumeProfile(candles, opts = {}) {
  const { lookback = 60, binCount = 24, valueAreaPercent = 0.7 } = opts

  const window = candles.slice(-lookback)
  if (window.length < 2) return null

  const priceLow = Math.min(...window.map((c) => c.low))
  const priceHigh = Math.max(...window.map((c) => c.high))
  if (!(priceHigh > priceLow)) return null

  const binWidth = (priceHigh - priceLow) / binCount

  /** @type {Bin[]} */
  const bins = Array.from({ length: binCount }, (_, i) => {
    const lower = priceLow + i * binWidth
    const upper = lower + binWidth
    return { lower, upper, mid: (lower + upper) / 2, volume: 0 }
  })

  for (const c of window) {
    const dayLow = c.low
    const dayHigh = Math.max(c.high, c.low + 1e-6) // guard zero-range days
    const span = dayHigh - dayLow

    for (const bin of bins) {
      const overlap = Math.min(dayHigh, bin.upper) - Math.max(dayLow, bin.lower)
      if (overlap > 0) bin.volume += c.volume * (overlap / span)
    }
  }

  const poc = bins.reduce((a, b) => (b.volume > a.volume ? b : a), bins[0])
  const { low: valueAreaLow, high: valueAreaHigh } = computeValueArea(
    bins,
    poc,
    valueAreaPercent,
  )

  return {
    bins,
    poc,
    valueAreaLow,
    valueAreaHigh,
    lastClose: window[window.length - 1].close,
    periodDays: window.length,
    maxBinVolume: Math.max(...bins.map((b) => b.volume)),
    priceLow,
    priceHigh,
    totalVolume: bins.reduce((sum, b) => sum + b.volume, 0),
  }
}

/**
 * Grow outward from the POC, repeatedly absorbing the heavier neighboring bin,
 * until the accumulated volume reaches the target fraction of the total.
 */
function computeValueArea(bins, poc, targetFraction) {
  const total = bins.reduce((sum, b) => sum + b.volume, 0)
  const pocIndex = bins.indexOf(poc)
  if (total <= 0 || pocIndex < 0) return { low: poc.lower, high: poc.upper }

  let lower = pocIndex
  let upper = pocIndex
  let accumulated = bins[pocIndex].volume
  const target = total * targetFraction

  while (accumulated < target && (lower > 0 || upper < bins.length - 1)) {
    const belowVol = lower > 0 ? bins[lower - 1].volume : -1
    const aboveVol = upper < bins.length - 1 ? bins[upper + 1].volume : -1

    if (aboveVol >= belowVol) {
      upper += 1
      accumulated += bins[upper].volume
    } else {
      lower -= 1
      accumulated += bins[lower].volume
    }
  }

  return { low: bins[lower].lower, high: bins[upper].upper }
}

/** Compact volume formatter: 1_500_000 → "1.5M". */
export function formatVolume(v) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${Math.round(v)}`
}

/** USD price formatter. */
export function formatPrice(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(v)
}
