import { useCallback, useState } from 'react'
import { fetchDailyCandles, fetchCashFlow, MarketDataError } from '../api/marketData'
import { buildVolumeProfile } from '../lib/volumeProfile'

/**
 * Orchestrates fetch → calculate → state. Keeps the components dumb.
 */
export function useVolumeProfile() {
  const [symbol, setSymbol] = useState('')
  const [lookback, setLookback] = useState(60)
  const [profile, setProfile] = useState(null)
  const [cashFlow, setCashFlow] = useState(null)
  const [activeSymbol, setActiveSymbol] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)

  const analyze = useCallback(
    async (rawSymbol, days = lookback) => {
      const ticker = (rawSymbol ?? symbol).trim()
      if (!ticker) return

      setStatus('loading')
      setError(null)

      try {
        const candles = await fetchDailyCandles(ticker)
        const built = buildVolumeProfile(candles, { lookback: days })
        if (!built) {
          throw new MarketDataError('no-data', 'Not enough data to build a profile.')
        }
        setProfile(built)
        setActiveSymbol(ticker.toUpperCase())
        setStatus('ready')
      } catch (e) {
        setError(
          e instanceof MarketDataError
            ? e.message
            : e.message || 'Something went wrong.',
        )
        setProfile(null)
        setCashFlow(null)
        setStatus('error')
        return
      }

      // Fetch cash flow after the profile is displayed — keeps the critical
      // path fast and avoids triggering Safari's concurrent-request limits.
      fetchCashFlow(ticker)
        .then((data) => setCashFlow(data))
        .catch(() => setCashFlow(null))
    },
    [symbol, lookback],
  )

  // Re-run with a new lookback if we already have a result.
  const changeLookback = useCallback(
    (days) => {
      setLookback(days)
      if (activeSymbol) analyze(activeSymbol, days)
    },
    [activeSymbol, analyze],
  )

  return {
    symbol,
    setSymbol,
    lookback,
    changeLookback,
    profile,
    cashFlow,
    activeSymbol,
    status,
    error,
    analyze,
  }
}
