import { motion } from 'framer-motion';
import { Bell, Wifi, WifiOff, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { healthApi } from '../../api/services';
import Badge from '../ui/Badge';

export default function Header({ title, subtitle }) {
  const [health, setHealth] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    healthApi.check()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline' }));

    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const isHealthy = health?.status === 'healthy';

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-sentinel-bg/60 border-b border-white/5 px-8 py-4">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {time.toLocaleTimeString()}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            {isHealthy ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">
              {isHealthy ? 'Backend Online' : 'Backend Offline'}
            </span>
            {health?.model_ready && (
              <Badge variant="success" className="text-[10px]">ML Ready</Badge>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
