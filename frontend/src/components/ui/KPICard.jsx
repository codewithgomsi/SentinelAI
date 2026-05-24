import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function KPICard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  delay = 0,
  glow = false,
}) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', glow: 'shadow-glow' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400', glow: 'shadow-glow-cyan' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', glow: 'shadow-glow-purple' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', glow: 'shadow-glow-red' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: '' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', glow: '' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', glow: '' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', glow: '' },
  };

  const c = colorMap[color] || colorMap.indigo;
  const isPositiveTrend = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-6 relative overflow-hidden group ${glow ? c.glow : ''}`}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <motion.div className="space-y-3">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              {value}
            </motion.span>
            {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
          {trendLabel && (
            <motion.div className="flex items-center gap-1 text-xs">
              {trend != null && (
                isPositiveTrend
                  ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                  : <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={trend > 0 ? 'text-emerald-400' : 'text-gray-400'}>
                {trendLabel}
              </span>
            </motion.div>
          )}
        </motion.div>

        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
            <Icon className={`w-6 h-6 ${c.icon}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
