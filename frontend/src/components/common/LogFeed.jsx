import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatTimestamp, formatLatency, truncate } from '../../utils/formatters';
import { getStatusCodeColor } from '../../utils/colors';

function LogRow({ log, index }) {
  const isAnomaly = log.is_anomaly === 1 || log.is_anomaly === true;
  const statusColor = getStatusCodeColor(log.status_code);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 font-mono text-xs hover:bg-white/5 transition-colors ${
        isAnomaly ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''
      }`}
    >
      <span className="text-gray-500 w-36 shrink-0">{formatTimestamp(log.timestamp)}</span>
      <span
        className="font-bold w-12 shrink-0"
        style={{ color: statusColor }}
      >
        {log.status_code}
      </span>
      <span className="text-cyan-400 w-14 shrink-0">{log.method}</span>
      <span className="text-gray-300 flex-1 truncate">{truncate(log.endpoint, 50)}</span>
      <span className="text-purple-400 w-20 shrink-0 text-right">{formatLatency(log.latency_ms)}</span>
      <span className="text-gray-500 w-24 shrink-0 truncate hidden md:block">{log.location}</span>
      {isAnomaly ? (
        <Badge severity={log.severity || 'high'} className="shrink-0">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Anomaly
        </Badge>
      ) : (
        <Badge variant="success" className="shrink-0">Normal</Badge>
      )}
    </motion.div>
  );
}

export default function LogFeed({ logs = [], maxHeight = 'max-h-[600px]' }) {
  return (
    <div className={`terminal-panel overflow-hidden ${maxHeight}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-xs font-medium tracking-wider uppercase">
          Live Log Stream
        </span>
        <span className="ml-auto text-gray-500 text-xs">{logs.length} entries</span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 44px)' }}>
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <LogRow key={`${log.timestamp}-${log.session_id}-${i}`} log={log} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
