import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import Card, { CardHeader } from '../ui/Card';
import { CHART_COLORS } from '../../utils/colors';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs border border-indigo-500/30 !rounded-lg">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color || entry.fill }} className="font-mono">
          {entry.name}: {entry.value?.toLocaleString?.() ?? entry.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendBarChart({
  data,
  dataKey = 'count',
  nameKey = 'label',
  title,
  subtitle,
  icon,
  height = 280,
  colors,
  className = '',
}) {
  const palette = colors || CHART_COLORS;

  return (
    <Card className={className}>
      {(title || subtitle) && <CardHeader title={title} subtitle={subtitle} icon={icon} />}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" vertical={false} />
            <XAxis dataKey={nameKey} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
              {data?.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
