import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Lightbulb, Target, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatTimestamp, formatLatency, formatPercent } from '../../utils/formatters';

export default function IncidentCard({ incident, onClick, expanded = false }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card glow={incident.severity === 'critical'} hover className="relative overflow-hidden">
        {incident.severity === 'critical' && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-500/5 pointer-events-none"
          />
        )}

        <div className="relative">
          <motion.div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-indigo-400">{incident.incident_id}</span>
                <Badge severity={incident.severity} />
                <Badge status={incident.status} />
              </div>
              <h3 className="text-lg font-semibold text-white">{incident.affected_endpoint}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Detected</p>
              <p className="text-xs text-gray-400 font-mono">{formatTimestamp(incident.detected_at)}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500">Status Code</p>
              <p className="text-lg font-bold text-red-400 font-mono">{incident.status_code}</p>
            </div>
            <motion.div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500">Anomaly Rate</p>
              <p className="text-lg font-bold text-orange-400">{formatPercent(incident.anomaly_rate * 100)}</p>
            </motion.div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500">Avg Latency</p>
              <p className="text-lg font-bold text-purple-400">{formatLatency(incident.avg_latency_ms)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Impact
              </p>
              <p className="text-sm font-medium text-yellow-400 line-clamp-2">{incident.business_impact?.slice(0, 40)}...</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <Target className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-400 font-medium mb-1">Probable Root Cause</p>
                <p className="text-sm text-gray-300">{incident.probable_root_cause}</p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-1">Suggested Fix</p>
                <p className="text-sm text-gray-300">{incident.suggested_fix}</p>
              </div>
            </div>
          </div>

          {expanded && incident.timeline && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Incident Timeline
              </p>
              <div className="space-y-3">
                {incident.timeline.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 items-start"
                  >
                    <motion.div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-gray-500">{formatTimestamp(event.time)}</p>
                      <p className="text-sm text-gray-300">{event.event}</p>
                      <Badge variant="info" className="mt-1 text-[10px]">{event.type}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
