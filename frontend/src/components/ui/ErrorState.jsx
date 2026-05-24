import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ error, onRetry, title = 'Connection Error' }) {
  const isOffline = error?.includes('Cannot reach') || error?.includes('offline');
  const isTimeout = error?.includes('timed out');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 flex flex-col items-center text-center max-w-lg mx-auto"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`p-4 rounded-2xl mb-5 ${isOffline ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}
      >
        {isOffline ? (
          <WifiOff className="w-10 h-10 text-red-400" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
        )}
      </motion.div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-2 max-w-sm">{error}</p>

      {isOffline && (
        <p className="text-xs text-gray-500 mb-6">
          Start the backend: <code className="text-cyan-400">cd backend && python app.py</code>
        </p>
      )}

      {isTimeout && (
        <p className="text-xs text-gray-500 mb-6">
          Model evaluation may take longer on first run while training completes.
        </p>
      )}

      {onRetry && (
        <Button onClick={onRetry} icon={RefreshCw} variant="secondary">
          Retry Connection
        </Button>
      )}
    </motion.div>
  );
}
