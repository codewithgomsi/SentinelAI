import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card, { CardHeader } from '../ui/Card';
import { CHART_COLORS } from '../../utils/colors';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="glass-card p-3 text-xs border border-indigo-500/30 !rounded-lg">
      <p className="text-gray-300 font-medium">{item.name}</p>
      <p className="font-mono" style={{ color: item.payload.fill }}>
        {item.value?.toLocaleString?.()} ({item.payload.percent?.toFixed?.(1)}%)
      </p>
    </div>
  );
};

export default function DistributionPieChart({
  data,
  title,
  subtitle,
  icon,
  height = 280,
  colors,
  className = '',
}) {
  const palette = colors || CHART_COLORS;
  const total = data?.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
  const enriched = data?.map((d) => ({ ...d, percent: ((d.value / total) * 100) })) || [];

  return (
    <Card className={className}>
      {(title || subtitle) && <CardHeader title={title} subtitle={subtitle} icon={icon} />}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {enriched.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
              formatter={(value) => <span className="text-gray-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
