export function formatNumber(num, decimals = 0) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(num, decimals = 1) {
  if (num == null || isNaN(num)) return '—';
  return `${Number(num).toFixed(decimals)}%`;
}

export function formatLatency(ms) {
  if (ms == null || isNaN(ms)) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function formatTimestamp(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export function formatRelativeTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatTimestamp(ts);
}

export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
