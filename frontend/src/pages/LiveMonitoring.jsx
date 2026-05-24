import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Pause, Play, Radio, RefreshCw } from 'lucide-react';
import Header from '../components/layout/Header';
import LogFeed from '../components/common/LogFeed';
import KPICard from '../components/ui/KPICard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { usePolling } from '../hooks/useApi';
import { liveLogsApi } from '../api/services';
import { formatNumber, formatLatency } from '../utils/formatters';

const FILTERS = [
  { value: 'all', label: 'All Logs' },
  { value: 'anomaly', label: 'Anomalies Only' },
  { value: 'error', label: 'Errors Only' },
];

export default function LiveMonitoring() {
  const [filter, setFilter] = useState('all');
  const [count, setCount] = useState(40);

  const fetchLogs = useCallback(
    () => liveLogsApi.get({ count, filter }),
    [count, filter]
  );

  const { data, loading, error, refetch, polling, setPolling } = usePolling(fetchLogs, 5000, [count, filter]);

  const summary = data?.summary || {};

  return (
    <div>
      <Header title="Live Monitoring" subtitle="Real-time log stream with 5s auto-refresh" />

      <div className="p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Badge variant={polling ? 'success' : 'warning'}>
              <Radio className={`w-3 h-3 mr-1 ${polling ? 'animate-pulse' : ''}`} />
              {polling ? 'LIVE' : 'PAUSED'}
            </Badge>
            {data?.fetched_at && (
              <span className="text-xs text-gray-500 font-mono">
                Last update: {new Date(data.fetched_at).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f.value
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Filter className="w-3 h-3 inline mr-1" />
                  {f.label}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={polling ? Pause : Play}
              onClick={() => setPolling(!polling)}
            >
              {polling ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refetch} loading={loading}>
              Refresh
            </Button>
          </div>
        </motion.div>

        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading && !data ? (
                [...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="kpi" />)
              ) : (
                <>
                  <KPICard title="Total Logs" value={formatNumber(summary.total)} color="cyan" delay={0} />
                  <KPICard title="Anomalies" value={formatNumber(summary.anomalies)} color="red" glow delay={0.1} />
                  <KPICard title="Errors" value={formatNumber(summary.errors)} color="orange" delay={0.2} />
                  <KPICard title="Avg Latency" value={formatLatency(summary.avg_latency)} color="purple" delay={0.3} />
                </>
              )}
            </div>

            {data?.logs?.length ? (
              <LogFeed logs={data.logs} maxHeight="max-h-[calc(100vh-320px)]" />
            ) : (
              !loading && (
                <div className="glass-card p-12 text-center text-gray-400">
                  No logs match the current filter
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
