import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, ShieldAlert, Target, Zap } from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import AnomalyTable from '../components/common/AnomalyTable';
import TrendBarChart from '../components/charts/BarChart';
import DistributionPieChart from '../components/charts/PieChart';
import Card, { CardHeader } from '../components/ui/Card';
import { useApi } from '../hooks/useApi';
import { anomalyApi } from '../api/services';
import { formatNumber, formatPercent } from '../utils/formatters';
import { SEVERITY_COLORS } from '../utils/colors';

export default function AnomalyDetection() {
  const fetchAnomalies = useCallback(() => anomalyApi.get({ count: 50 }), []);
  const { data, loading, error, refetch } = useApi(fetchAnomalies, []);

  if (loading && !data) {
    return (
      <motion.div>
        <Header title="ML Anomaly Detection" subtitle="Isolation Forest powered threat detection" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="kpi" />)}
          </div>
          <LoadingSkeleton type="table" />
        </div>
      </motion.div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="ML Anomaly Detection" subtitle="Isolation Forest powered threat detection" />
        <div className="p-8"><ErrorState error={error} onRetry={refetch} /></div>
      </div>
    );
  }

  const severityData = Object.entries(data?.severity_breakdown || {})
    .filter(([k]) => k !== 'none')
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: SEVERITY_COLORS[name]?.hex,
    }));

  const scoreDistribution = (data?.logs || [])
    .filter((l) => l.is_anomaly)
    .slice(0, 15)
    .map((l, i) => ({
      label: `#${i + 1}`,
      count: Math.abs(l.score || 0) * 100,
    }));

  return (
    <div>
      <Header title="ML Anomaly Detection" subtitle="Isolation Forest powered threat detection" />

      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <Button variant="secondary" icon={RefreshCw} onClick={refetch} loading={loading}>
            Re-scan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPICard title="Total Scanned" value={formatNumber(data?.total)} icon={Target} color="cyan" glow delay={0} />
          <KPICard title="Anomalies Found" value={formatNumber(data?.anomaly_count)} icon={ShieldAlert} color="red" glow delay={0.1} />
          <KPICard title="Anomaly Rate" value={formatPercent(data?.anomaly_pct)} icon={Zap} color="orange" delay={0.2} />
          <KPICard title="ML Model" value="Isolation Forest" icon={Brain} color="purple" delay={0.3} trendLabel="200 estimators" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <DistributionPieChart
            data={severityData}
            title="Severity Breakdown"
            subtitle="Anomaly classification distribution"
            icon={ShieldAlert}
            height={280}
          />
          <div className="xl:col-span-2">
            <TrendBarChart
              data={scoreDistribution}
              dataKey="count"
              nameKey="label"
              title="Anomaly Score Visualization"
              subtitle="Confidence indicators for detected anomalies"
              icon={Brain}
              height={280}
              colors={['#ef4444', '#f97316', '#eab308', '#3b82f6']}
            />
          </div>
        </div>

        <Card glow>
          <CardHeader
            title="Anomaly Detection Results"
            subtitle={`${data?.anomaly_count} anomalies in ${data?.total} requests`}
            icon={ShieldAlert}
          />
          <AnomalyTable logs={data?.logs || []} />
        </Card>
      </div>
    </div>
  );
}
