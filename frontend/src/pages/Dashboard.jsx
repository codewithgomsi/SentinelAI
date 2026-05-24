import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Clock,
  Globe,
  Server,
  Zap,
} from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import TrendLineChart from '../components/charts/LineChart';
import TrendBarChart from '../components/charts/BarChart';
import DistributionPieChart from '../components/charts/PieChart';
import Card, { CardHeader } from '../components/ui/Card';
import LogFeed from '../components/common/LogFeed';
import { useApi } from '../hooks/useApi';
import { dashboardApi } from '../api/services';
import { formatNumber, formatPercent, formatLatency } from '../utils/formatters';
import { CHART_COLORS } from '../utils/colors';

export default function Dashboard() {
  const fetchDashboard = useCallback(() => dashboardApi.get(), []);
  const { data, loading, error, refetch } = useApi(fetchDashboard, []);

  if (loading && !data) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Real-time system overview" />
        <motion.div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="kpi" />)}
        </motion.div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Real-time system overview" />
        <div className="p-8"><ErrorState error={error} onRetry={refetch} /></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusData = data?.status_distribution?.map((s, i) => ({
    label: s.label || s.code,
    count: s.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  const trendLines = [
    { key: 'requests', name: 'Requests', color: '#06b6d4' },
    { key: 'anomalies', name: 'Anomalies', color: '#ef4444' },
    { key: 'errors', name: 'Errors', color: '#f97316' },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Real-time system overview & KPI metrics" />

      <div className="p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
        >
          <KPICard
            title="Total Requests"
            value={formatNumber(kpis.total_requests)}
            icon={Globe}
            color="cyan"
            glow
            delay={0}
            trendLabel="Last 24 hours"
          />
          <KPICard
            title="Anomalies Detected"
            value={formatNumber(kpis.anomalies_detected)}
            icon={AlertTriangle}
            color="red"
            glow
            delay={0.1}
            trendLabel="ML flagged events"
          />
          <KPICard
            title="System Health"
            value={formatPercent(kpis.uptime_pct)}
            icon={Activity}
            color="green"
            delay={0.2}
            trendLabel="Uptime percentage"
          />
          <KPICard
            title="Avg Latency"
            value={formatLatency(kpis.avg_latency_ms)}
            icon={Clock}
            color="purple"
            delay={0.3}
            trendLabel={`Error rate: ${formatPercent(kpis.error_rate_pct)}`}
          />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TrendLineChart
              data={data?.hourly_trend || []}
              lines={trendLines}
              title="Hourly Traffic Trend"
              subtitle="Requests, anomalies, and errors over time"
              icon={Activity}
              height={320}
            />
          </div>
          <DistributionPieChart
            data={statusData.map((s) => ({ name: s.label, value: s.count }))}
            title="Status Distribution"
            subtitle="HTTP response codes breakdown"
            icon={Server}
            height={320}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TrendBarChart
            data={data?.top_endpoints?.map((e) => ({
              label: e.endpoint?.split('/').pop() || e.endpoint,
              count: e.requests,
            })) || []}
            dataKey="count"
            nameKey="label"
            title="Top Endpoints"
            subtitle="Most requested API endpoints"
            icon={Zap}
            height={280}
          />

          <Card>
            <CardHeader title="Recent Activity" subtitle="Latest log entries" icon={Activity} />
            <LogFeed logs={data?.recent_logs || []} maxHeight="max-h-[280px]" />
          </Card>
        </div>
      </div>
    </div>
  );
}
