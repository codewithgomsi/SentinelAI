import { getSeverityClasses, getStatusClasses } from '../../utils/colors';
import { capitalize } from '../../utils/formatters';

export default function Badge({ children, variant = 'default', severity, status, className = '' }) {
  let classes = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

  if (severity) {
    classes += ` ${getSeverityClasses(severity)}`;
  } else if (status) {
    classes += ` ${getStatusClasses(status)}`;
  } else {
    const variants = {
      default: 'text-gray-300 bg-gray-500/10 border-gray-500/30',
      success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      danger: 'text-red-400 bg-red-500/10 border-red-500/30',
      info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    };
    classes += ` ${variants[variant] || variants.default}`;
  }

  return (
    <span className={`${classes} ${className}`}>
      {typeof children === 'string' ? capitalize(children) : children}
    </span>
  );
}
