import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Data', message = 'Nothing to display yet.', icon: Icon = Inbox }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-12 flex flex-col items-center text-center"
    >
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
        <Icon className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{message}</p>
    </motion.div>
  );
}
