import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  Cpu,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import ConfusionMatrix from '../components/charts/ConfusionMatrix';
import DistributionPieChart from '../components/charts/PieChart';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useApi } from '../hooks/useApi';
import { modelEvalApi } from '../api/services';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function ModelEvaluation() {
  const [retraining, setRetraining] = useState(false);

  const fetchEval = useCallback(() => modelEvalApi.get(), []);
  const { data, loading, error, refetch } = useApi(fetchEval, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await modelEvalApi.retrain();
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setRetraining(false);
    }
  };

  if (loading && !data) {
    return (
      <div>
        <Header title="Model Evaluation" subtitle="ML model performance metrics" />
        <div className="p-8 space-y-6">
          <p className="text-sm text-yellow-400/80 animate-pulse">
            First load may take longer while the model trains...
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} type="kpi" />)}
          </div>
          <LoadingSkeleton type="chart" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="Model Evaluation" subtitle="ML model performance metrics" />
        <div className="p-8">
          <ErrorState
            error={error}
            onRetry={refetch}
            title="Model Evaluation Error"
          />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const modelInfo = data?.model_info || {};
  const distribution = data?.distribution || {};

  const distData = [
    { name: 'Normal', value: distribution.normal },
    { name: 'Anomaly', value: distribution.anomaly },
  ];

  const metricCards = [
    { title: 'Accuracy', value: formatPercent(metrics.accuracy * 100, 1), color: 'cyan', icon: Target },
    { title: 'Precision', value: formatPercent(metrics.precision * 100, 1), color: 'purple', icon: Brain },
    { title: 'Recall', value: formatPercent(metrics.recall * 100, 1), color: 'green', icon: TrendingUp },
    { title: 'F1 Score', value: formatPercent(metrics.f1_score * 100, 1), color: 'orange', icon: CheckCircle },
  ];

  return (
    <div>
      <Header title="Model Evaluation" subtitle="Isolation Forest performance analysis" />

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="success">{modelInfo.status || 'trained'}</Badge>
            <span className="text-sm text-gray-400">
              {modelInfo.algorithm} · {formatNumber(modelInfo.n_estimators)} estimators · {formatNumber(modelInfo.n_samples)} samples
            </span>
          </div>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={handleRetrain}
            loading={retraining}
          >
            Retrain Model
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {metricCards.map((m, i) => (
            <KPICard
              key={m.title}
              title={m.title}
              value={m.value}
              icon={m.icon}
              color={m.color}
              glow={i === 0}
              delay={i * 0.1}
            />
          ))}
        </div>

        <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ConfusionMatrix
              matrix={data?.confusion_matrix?.matrix}
              labels={data?.confusion_matrix?.labels}
              stats={data?.confusion_matrix?.stats}
              title="Confusion Matrix"
              subtitle="Classification performance breakdown"
              icon={Cpu}
            />
          </div>
          <DistributionPieChart
            data={distData}
            title="Anomaly Distribution"
            subtitle={`${formatPercent(distribution.anomaly_pct)} anomalous`}
            colors={['#10b981', '#ef4444']}
            icon={Brain}
            height={320}
          />
        </motion.div>

        <Card>
          <CardHeader title="Model Configuration" subtitle="Training parameters and features" icon={Cpu} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Algorithm', value: modelInfo.algorithm },
              { label: 'Estimators', value: modelInfo.n_estimators },
              { label: 'Contamination', value: modelInfo.contamination },
              { label: 'Features', value: modelInfo.n_features },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-white font-mono">{item.value}</p>
              </div>
            ))}
          </div>
          {data?.feature_names && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.feature_names.map((f) => (
                <Badge key={f} variant="purple">{f}</Badge>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
