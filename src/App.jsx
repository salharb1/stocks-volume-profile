import SearchBar from './components/SearchBar'
import SummaryCard from './components/SummaryCard'
import VolumeProfileChart from './components/VolumeProfileChart'
import CashFlowChart from './components/CashFlowChart'
import { EmptyState, ErrorBanner, LoadingState } from './components/StateViews'
import { useVolumeProfile } from './hooks/useVolumeProfile'

export default function App() {
  const vp = useVolumeProfile()
  const loading = vp.status === 'loading'

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Volume <span className="text-accent">Profile</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Find high-volume nodes and key entry zones for US stocks.
          </p>
        </header>

        <SearchBar
          symbol={vp.symbol}
          setSymbol={vp.setSymbol}
          lookback={vp.lookback}
          onLookback={vp.changeLookback}
          onSubmit={(s) => vp.analyze(s)}
          loading={loading}
        />

        <section className="mt-10">
          {vp.status === 'error' && <ErrorBanner message={vp.error} />}

          {loading && <LoadingState />}

          {!loading && vp.status === 'ready' && vp.profile && (
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-2">
                  <SummaryCard profile={vp.profile} symbol={vp.activeSymbol} />
                </div>
                <div className="md:col-span-3 rounded-3xl border border-white/10 bg-panel/50 p-5">
                  <h3 className="mb-1 text-sm font-semibold text-slate-200">
                    {vp.activeSymbol} · Volume by Price
                  </h3>
                  <p className="mb-3 text-xs text-slate-500">
                    Horizontal bars show traded volume at each price level.
                  </p>
                  <VolumeProfileChart profile={vp.profile} />
                </div>
              </div>

              {vp.cashFlow && vp.cashFlow.length > 0 && (
                <CashFlowChart data={vp.cashFlow} symbol={vp.activeSymbol} />
              )}
            </div>
          )}

          {!loading && vp.status !== 'ready' && vp.status !== 'error' && <EmptyState />}
        </section>

        <footer className="mt-16 text-center text-xs text-slate-600">
          Educational tool · Not investment advice · Data via Alpha Vantage
        </footer>
      </main>
    </div>
  )
}
