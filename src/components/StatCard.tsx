import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Session } from '../lib/sessions';

interface StatCardProps {
  title: string;
  sessions: Session[];
  zoneType: string;
  value: string | number;
  subtitle?: string;
  metric?: 'pps' | 'efg' | 'pct';
  isHighlight?: boolean;
  delay?: number;
}

export default function StatCard({ 
  title, 
  sessions, 
  zoneType, 
  value, 
  subtitle, 
  metric = 'pct', 
  isHighlight, 
  delay = 0 
}: StatCardProps) {
  
  const chartData = useMemo(() => {
    const sorted = (zoneType === 'global'
      ? sessions.filter(s => s.zoneType)
      : sessions.filter(s => s.zoneType === zoneType)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-15);

    return sorted.map((s, i) => {
      let val = 0;
      if (metric === 'pps') {
        const pts = (s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1));
        val = pts / s.total;
      } else if (metric === 'efg') {
        const bonus = s.zoneType === '3p' ? 0.5 * s.made : 0;
        val = ((s.made + bonus) / s.total) * 100;
      } else {
        val = (s.made / s.total) * 100;
      }
      return { val, id: i };
    });
  }, [sessions, zoneType, metric]);

  return (
    <motion.div
      className={`rounded-xl border p-3 transition-all duration-300 relative overflow-hidden ${
        isHighlight
          ? 'glass-card-accent border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
          : 'glass-card border-border hover:border-primary/20'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-1 relative z-10">
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className={`font-mono text-lg font-bold ${isHighlight ? 'text-primary stat-glow' : 'text-foreground'}`}>
          {value === "0.00" || value === "0.0" || value === 0 ? "—" : value}
          {title.includes('%') && value !== "0.0" && value !== 0 && <span className="text-xs ml-0.5 opacity-70">%</span>}
        </span>
      </div>

      {chartData.length > 1 && (
        <div className="h-10 w-full mt-1 relative z-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${zoneType}-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill={`url(#grad-${zoneType}-${metric})`}
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {subtitle && (
        <p className="text-[10px] text-muted-foreground mt-1 font-medium italic relative z-10">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
