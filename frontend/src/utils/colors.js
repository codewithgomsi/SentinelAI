export const SEVERITY_COLORS = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', hex: '#ef4444' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', hex: '#f97316' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', hex: '#eab308' },
  low: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', hex: '#3b82f6' },
  none: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', hex: '#6b7280' },
};

export const STATUS_COLORS = {
  healthy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  degraded: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  outage: { text: 'text-red-500', bg: 'bg-red-600/20', border: 'border-red-600/40' },
  active: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  resolved: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  investigating: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

export const CHART_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#eab308'];

export function getSeverityClasses(severity) {
  const key = (severity || 'none').toLowerCase();
  const colors = SEVERITY_COLORS[key] || SEVERITY_COLORS.none;
  return `${colors.text} ${colors.bg} ${colors.border}`;
}

export function getStatusClasses(status) {
  const key = (status || 'healthy').toLowerCase();
  const colors = STATUS_COLORS[key] || STATUS_COLORS.healthy;
  return `${colors.text} ${colors.bg} ${colors.border}`;
}

export function getStatusCodeColor(code) {
  const c = Number(code);
  if (c >= 500) return '#ef4444';
  if (c >= 400) return '#f97316';
  if (c >= 300) return '#eab308';
  return '#10b981';
}
