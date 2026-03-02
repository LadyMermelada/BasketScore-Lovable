import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  isHighlight?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, isHighlight, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-4 border ${
        isHighlight 
        ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' 
        : 'bg-card border-border'
      }`}
    >
      {isHighlight && (
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <div className="w-16 h-16 rounded-full bg-primary" />
        </div>
      )}
      
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {title}
      </p>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black tracking-tight ${isHighlight ? 'text-primary' : 'text-foreground'}`}>
          {value === "0.00" || value === "0.0" ? "—" : value}
        </span>
        {title.includes('%') && value !== "0.0" && <span className="text-sm font-bold opacity-70">%</span>}
      </div>

      {subtitle && (
        <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
