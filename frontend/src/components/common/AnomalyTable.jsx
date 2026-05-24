import { motion } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatTimestamp, formatLatency, truncate } from '../../utils/formatters';
import { getStatusCodeColor } from '../../utils/colors';

function ScoreBar({ score, severity }) {
  const normalized = Math.min(Math.abs(score || 0) * 100, 100);
  const colors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    none: 'bg-gray-500',
  };
  const barColor = colors[severity] || colors.none;

  return (
    <div className="flex items-center gap-2">
      <motion.div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </motion.div>
      <span className="text-xs font-mono text-gray-400 w-16 text-right">
        {(score || 0).toFixed(3)}
      </span>
    </div>
  );
}

export default function AnomalyTable({ logs = [] }) {
  const anomalies = logs.filter((l) => l.is_anomaly === 1 || l.is_anomaly === true);

  if (!anomalies.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Zap className="w-8 h-8 mx-auto mb-3 text-emerald-400 opacity-50" />
        <p>No anomalies detected in current batch</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Timestamp', 'Endpoint', 'Status', 'Latency', 'Score', 'Severity', 'Location'].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {anomalies.map((log, i) => (
            <motion.tr
              key={`${log.timestamp}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-3 px-4 font-mono text-xs text-gray-400">{formatTimestamp(log.timestamp)}</td>
              <td className="py-3 px-4 text-gray-300">{truncate(log.endpoint, 35)}</td>
              <td className="py-3 px-4">
                <span className="font-mono font-bold" style={{ color: getStatusCodeColor(log.status_code) }}>
                  {log.status_code}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-purple-400">{formatLatency(log.latency_ms)}</td>
              <td className="py-3 px-4 w-40">
                <ScoreBar score={log.score} severity={log.severity} />
              </td>
              <td className="py-3 px-4">
                <Badge severity={log.severity}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {log.severity}
                </Badge>
              </td>
              <td className="py-3 px-4 text-gray-400">{log.location}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
