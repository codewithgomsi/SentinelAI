import { motion } from 'framer-motion';

export default function Card({ children, className = '', glow = false, hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card ${hover ? 'glass-card-hover' : ''} p-6 ${glow ? 'neon-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
