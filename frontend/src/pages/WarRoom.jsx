import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  GitBranch,
  HeartPulse,
  Radio,
  Shield,
  Swords,
  Terminal,
  Zap,
} from 'lucide-react';
import Header from '../components/layout/Header';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import Card, { CardHeader } from '../components/ui/Card';
import IncidentCard from '../components/common/IncidentCard';
import { usePolling } from '../hooks/useApi';
import { warRoomApi } from '../api/services';
import { formatTimestamp } from '../utils/formatters';
import { getStatusClasses } from '../utils/colors';

function HealthScoreRing({ score, status }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#eab308' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold text-white"
        >
          {score}
        </motion.span>
        <Badge status={status} className="mt-1 text-[10px]">{status}</Badge>
      </div>
    </div>
  );
}

function TerminalPanel({ title, lines, typing = false }) {
  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-500/20 bg-emerald-500/5">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-400 text-xs font-medium tracking-wider">{title}</span>
        <span className="ml-auto flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <span className="w-2 h-2 rounded-full bg-green-500/60" />
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-xs max-h-48">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.p
              key={`${line}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="text-emerald-300/80"
            >
              <span className="text-emerald-600 mr-2">&gt;</span>
              {line}
              {typing && i === lines.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle"
                />
              )}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ServiceHealthNode({ service }) {
  const statusClass = getStatusClasses(service.status);
  const isHealthy = service.status === 'healthy';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-xl border backdrop-blur-sm ${statusClass} transition-all`}
    >
      {!isHealthy && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl bg-red-500/10 pointer-events-none"
        />
      )}
      <motion.div className="relative flex items-center gap-2 mb-2">
        <HeartPulse className={`w-4 h-4 ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`} />
        <span className="text-sm font-medium text-white truncate">{service.service}</span>
      </motion.div>
      <div className="relative grid grid-cols-3 gap-1 text-[10px] font-mono">
        <div>
          <p className="text-gray-500">Latency</p>
          <p className="text-cyan-400">{service.latency_ms}ms</p>
        </div>
        <div>
          <p className="text-gray-500">Errors</p>
          <p className="text-orange-400">{(service.error_rate * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-500">Uptime</p>
          <p className="text-emerald-400">{service.uptime_pct}%</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function WarRoom() {
  const fetchWarRoom = useCallback(() => warRoomApi.get(), []);
  const { data, loading, error, refetch } = usePolling(fetchWarRoom, 10000, []);

  if (loading && !data) {
    return (
      <div>
        <Header title="AI War Room" subtitle="Cinematic incident command center" />
        <div className="p-8">
          <LoadingSkeleton type="page" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <Header title="AI War Room" subtitle="Cinematic incident command center" />
        <div className="p-8"><ErrorState error={error} onRetry={refetch} /></div>
      </div>
    );
  }

  const aiLines = [
    'Initializing SentinelAI neural analysis engine...',
    `System health score: ${data.system_health_score}/100 — status: ${data.system_status?.toUpperCase()}`,
    `${data.active_incident_count} active incidents detected across service mesh`,
    'Cross-referencing anomaly patterns with deployment timeline...',
    'Generating executive summary and recovery playbook...',
    'Analysis complete. Recommendations ready.',
  ];

  const alertLines = data.active_incidents?.slice(0, 4).map(
    (inc) => `[${inc.severity?.toUpperCase()}] ${inc.incident_id} — ${inc.affected_endpoint} — ${inc.status_code}`
  ) || ['No active critical alerts'];

  return (
    <div className="relative min-h-screen">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"
        />
      </div>

      <Header title="AI War Room" subtitle="Cinematic incident command center" />

      <div className="relative p-8 space-y-6">
        {/* Alert banner */}
        {data.active_incident_count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent"
            />
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </motion.div>
              <div>
                <p className="text-red-300 font-bold text-lg">
                  {data.active_incident_count} ACTIVE INCIDENT{data.active_incident_count > 1 ? 'S' : ''}
                </p>
                <p className="text-red-400/70 text-sm">Immediate attention required — AI analysis in progress</p>
              </div>
              <Badge variant="danger" className="ml-auto animate-pulse">
                <Radio className="w-3 h-3 mr-1" /> LIVE
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Top row: Health + AI Summary + Terminals */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card className="xl:col-span-3 text-center" glow>
            <CardHeader title="System Health" icon={Shield} />
            <HealthScoreRing score={data.system_health_score} status={data.system_status} />
            <p className="text-xs text-gray-500 mt-4 font-mono">
              Updated {formatTimestamp(data.generated_at)}
            </p>
          </Card>

          <Card className="xl:col-span-5 relative overflow-hidden" glow>
            <motion.div
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 pointer-events-none"
            />
            <CardHeader title="AI Executive Summary" subtitle="Neural incident analysis" icon={Bot} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative text-gray-300 leading-relaxed text-sm"
            >
              {data.executive_summary}
            </motion.p>
            <div className="relative mt-4 flex flex-wrap gap-2">
              <Badge variant="purple"><Zap className="w-3 h-3 mr-1" /> AI Generated</Badge>
              <Badge variant="info"><Clock className="w-3 h-3 mr-1" /> Real-time</Badge>
            </div>
          </Card>

          <div className="xl:col-span-4 space-y-4">
            <TerminalPanel title="AI ANALYSIS ENGINE" lines={aiLines} typing />
            <TerminalPanel title="SEVERITY ALERTS" lines={alertLines} />
          </div>
        </div>

        {/* Service health map */}
        <Card glow>
          <CardHeader
            title="Service Health Map"
            subtitle="Real-time microservice status grid"
            icon={HeartPulse}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {data.service_health_map?.map((service, i) => (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <ServiceHealthNode service={service} />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Middle row: Incidents + Actions + Checklist */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Active Incidents</h3>
            </div>
            {data.active_incidents?.length ? (
              data.active_incidents.map((incident, i) => (
                <motion.div
                  key={incident.incident_id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <IncidentCard incident={incident} expanded />
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-8 text-center text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                All systems operational
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card glow>
              <CardHeader title="Recovery Actions" subtitle="AI-recommended playbook" icon={Zap} />
              <motion.div className="space-y-3">
                {data.recommended_actions?.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-xl border ${
                      action.priority === 'immediate'
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-indigo-500/10 border-indigo-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={action.priority === 'immediate' ? 'danger' : 'info'}>
                        {action.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{action.owner}</span>
                    </div>
                    <p className="text-sm text-gray-300">{action.action}</p>
                  </motion.div>
                ))}
              </motion.div>
            </Card>

            <Card>
              <CardHeader title="SRE Checklist" icon={CheckCircle2} />
              <div className="space-y-2">
                {data.sre_checklist?.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item.task}
                      </p>
                      <Badge variant={item.priority === 'P0' ? 'danger' : 'warning'} className="text-[10px] mt-1">
                        {item.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent deployments timeline */}
        <Card>
          <CardHeader title="Attack & Deployment Timeline" subtitle="Recent changes correlated with incidents" icon={GitBranch} />
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-indigo-500/20" />
            <div className="space-y-4 pl-10">
              {data.recent_deployments?.map((dep, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[30px] top-2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-sentinel-bg" />
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{dep.service}</p>
                      <p className="text-xs text-gray-500 font-mono">{dep.version}</p>
                    </div>
                    <Badge variant={dep.status === 'success' ? 'success' : 'danger'}>{dep.status}</Badge>
                    <span className="text-xs text-gray-500 ml-auto font-mono">
                      {formatTimestamp(dep.deployed_at)}
                    </span>
                    <span className="text-xs text-gray-600">by {dep.deployed_by}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
