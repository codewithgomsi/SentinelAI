import { motion } from 'framer-motion';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
  );
}

export function KPICardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className={`glass-card p-6 ${height}`}>
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-5 w-48 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400"
      />
      <p className="text-gray-400 text-sm">Loading SentinelAI data...</p>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'page' }) {
  if (type === 'kpi') return <KPICardSkeleton />;
  if (type === 'chart') return <ChartSkeleton />;
  if (type === 'table') return <TableSkeleton />;
  return <PageLoader />;
}
