import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  Brain,
  BarChart3,
  FileWarning,
  Cpu,
  Swords,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live-monitoring', label: 'Live Monitoring', icon: Radio },
  { path: '/anomaly-detection', label: 'ML Anomaly Detection', icon: Brain },
  { path: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
  { path: '/incidents', label: 'Incident Reports', icon: FileWarning },
  { path: '/model-evaluation', label: 'Model Evaluation', icon: Cpu },
  { path: '/war-room', label: 'AI War Room', icon: Swords, highlight: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-white/5 bg-sentinel-surface/80 backdrop-blur-xl"
    >
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: ['0 0 10px rgba(59,130,246,0.3)', '0 0 25px rgba(139,92,246,0.5)', '0 0 10px rgba(59,130,246,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shrink-0"
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-lg font-bold neon-text">SentinelAI</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">DevOps Command</p>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              } ${item.highlight ? 'mt-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 shrink-0 relative z-10 ${
                    item.highlight ? 'text-purple-400' : ''
                  } ${isActive ? 'text-indigo-400' : ''}`}
                />
                {!collapsed && (
                  <span className="relative z-10 truncate">
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        LIVE
                      </span>
                    )}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
