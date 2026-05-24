import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Filter } from 'lucide-react';
import Header from '../components/layout/Header';
import IncidentCard from '../components/common/IncidentCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import KPICard from '../components/ui/KPICard';
import { useApi } from '../hooks/useApi';
import { incidentsApi } from '../api/services';
import { formatNumber } from '../utils/formatters';

const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low'];

export default function IncidentReports() {
  const [severity, setSeverity] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchIncidents = useCallback(
    () => incidentsApi.list({ count: 15, severity }),
    [severity]
  );

  const { data, loading, error, refetch } = useApi(fetchIncidents, [severity]);

  if (loading && !data) {
    return (
      <div>
        <Header title="Incident Reports" subtitle="AI-generated incident analysis & remediation" />
        <div className="p-8 space-y-4">
          {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} type="table" />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="Incident Reports" subtitle="AI-generated incident analysis & remediation" />
        <div className="p-8"><ErrorState error={error} onRetry={refetch} /></div>
      </div>
    );
  }

  const summary = data?.severity_summary || {};

  return (
    <div>
      <Header title="Incident Reports" subtitle="AI-generated incident analysis & remediation" />

      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  severity === s
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Badge variant="info">{data?.total || 0} incidents</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Critical" value={formatNumber(summary.critical)} color="red" glow delay={0} />
          <KPICard title="High" value={formatNumber(summary.high)} color="orange" delay={0.1} />
          <KPICard title="Medium" value={formatNumber(summary.medium)} color="yellow" delay={0.2} />
          <KPICard title="Low" value={formatNumber(summary.low)} color="blue" delay={0.3} />
        </div>

        {!data?.incidents?.length ? (
          <EmptyState
            title="No Incidents"
            message="No incidents match the selected severity filter."
            icon={FileWarning}
          />
        ) : (
          <div className="space-y-5">
            {data.incidents.map((incident, i) => (
              <motion.div
                key={incident.incident_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <IncidentCard
                  incident={incident}
                  expanded={expandedId === incident.incident_id}
                  onClick={() =>
                    setExpandedId(
                      expandedId === incident.incident_id ? null : incident.incident_id
                    )
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
