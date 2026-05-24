import { motion } from 'framer-motion';
import Card, { CardHeader } from '../ui/Card';
import { formatNumber } from '../../utils/formatters';

export default function ConfusionMatrix({ matrix, labels, stats, title, subtitle, icon }) {
  const rows = matrix?.length || 0;
  const cols = matrix?.[0]?.length || 0;

  const getCellColor = (row, col, value) => {
    const maxVal = Math.max(...matrix.flat());
    const intensity = maxVal > 0 ? value / maxVal : 0;
    if (row === col) {
      return `rgba(16, 185, 129, ${0.2 + intensity * 0.6})`;
    }
    return `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`;
  };

  return (
    <Card>
      <CardHeader title={title || 'Confusion Matrix'} subtitle={subtitle} icon={icon} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-gray-500 font-normal" />
              {labels?.map((label) => (
                <th key={label} className="p-2 text-gray-400 font-medium text-center">
                  Pred: {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix?.map((row, ri) => (
              <tr key={ri}>
                <td className="p-2 text-gray-400 font-medium">Actual: {labels?.[ri]}</td>
                {row.map((val, ci) => (
                  <td key={ci} className="p-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (ri * cols + ci) * 0.05 }}
                      className="rounded-lg p-4 text-center font-mono font-bold text-white border border-white/5"
                      style={{ backgroundColor: getCellColor(ri, ci, val) }}
                    >
                      {formatNumber(val)}
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/5">
          {[
            { label: 'True Positives', value: stats.true_positives, color: 'text-emerald-400' },
            { label: 'True Negatives', value: stats.true_negatives, color: 'text-cyan-400' },
            { label: 'False Positives', value: stats.false_positives, color: 'text-orange-400' },
            { label: 'False Negatives', value: stats.false_negatives, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{formatNumber(s.value)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
