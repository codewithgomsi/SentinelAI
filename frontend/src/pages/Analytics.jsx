import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Globe, MapPin, TrendingUp } from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import TrendLineChart from '../components/charts/LineChart';
import TrendBarChart from '../components/charts/BarChart';
import DistributionPieChart from '../components/charts/PieChart';
import { useApi } from '../hooks/useApi';
import { analyticsApi } from '../api/services';
import { formatNumber, formatPercent } from '../utils/formatters';
import { CHART_COLORS } from '../utils/colors';

const PERIODS = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('7d');

  const fetchAnalytics = useCallback(() => analyticsApi.get(period), [period]);
  const { data, loading, error, refetch } = useApi(fetchAnalytics, [period]);

  if (loading && !data) {
    return (
      <div>
        <Header title="Analytics & Trends" subtitle="Historical traffic and anomaly patterns" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="kpi" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <LoadingSkeleton type="chart" />
            <LoadingSkeleton type="chart" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="Analytics & Trends" subtitle="Historical traffic and anomaly patterns" />
        <div className="p-8"><ErrorState error={error} onRetry={refetch} /></div>
      </div>
    );
  }

  const summary = data?.summary || {};

  const methodData = Object.entries(data?.method_distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = data?.status_distribution?.map((s) => ({
    name: s.label || s.code,
    value: s.count,
  })) || [];

  const locationData = data?.location_heatmap?.slice(0, 8).map((l) => ({
    label: l.location,
    count: l.requests,
  })) || [];

  const trafficLines = [{ key: 'requests', name: 'Requests', color: '#06b6d4' }];

  const anomalyTrendData = data?.anomaly_trend?.map((d) => ({
    hour: d.date?.slice(5) || d.date,
    requests: d.requests,
    anomalies: d.anomalies,
    errors: 0,
  })) || [];

  const anomalyLines = [
    { key: 'requests', name: 'Requests', color: '#3b82f6' },
    { key: 'anomalies', name: 'Anomalies', color: '#ef4444' },
  ];

  return (
    <div>
      <Header title="Analytics & Trends" subtitle="Historical traffic and anomaly patterns" />

      <div className="p-8 space-y-6">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPICard title="Total Requests" value={formatNumber(summary.total_requests)} icon={Globe} color="cyan" glow delay={0} />
          <KPICard title="Total Anomalies" value={formatNumber(summary.total_anomalies)} icon={TrendingUp} color="red" delay={0.1} />
          <KPICard title="Anomaly Rate" value={formatPercent(summary.anomaly_rate)} icon={BarChart3} color="orange" delay={0.2} />
          <KPICard title="Error Rate" value={formatPercent(summary.error_rate)} icon={MapPin} color="purple" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TrendLineChart
            data={data?.hourly_traffic_pattern || []}
            lines={trafficLines}
            title="Hourly Traffic Pattern"
            subtitle="Request volume by hour of day"
            icon={TrendingUp}
            height={300}
          />
          <TrendLineChart
            data={anomalyTrendData}
            lines={anomalyLines}
            title="Anomaly Trend"
            subtitle="Anomalies vs requests over time"
            icon={BarChart3}
            height={300}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DistributionPieChart
            data={methodData}
            title="HTTP Methods"
            subtitle="Traffic distribution by method"
            icon={Globe}
            height={280}
          />
          <DistributionPieChart
            data={statusData}
            title="Status Codes"
            subtitle="Response code distribution"
            colors={['#10b981', '#eab308', '#f97316', '#ef4444']}
            icon={BarChart3}
            height={280}
          />
          <TrendBarChart
            data={locationData}
            dataKey="count"
            nameKey="label"
            title="Geographic Heatmap"
            subtitle="Top request locations"
            icon={MapPin}
            height={280}
          />
        </div>
      </div>
    </div>
  );
}
