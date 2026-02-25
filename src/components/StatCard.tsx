import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Session, getPercentage } from '@/lib/sessions';

interface Props {
  title: string;
  sessions: Session[];
  zoneType: string;
  isHighlight?: boolean;
  delay?: number;
}

export default function StatCard({ title, sessions, zoneType, isHighlight, delay = 0 }: Props) {
  const { average, chartData } = useMemo(() => {
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const filtered = zoneType === 'global'
      ? sessions.filter(s => new Date(s.date) >= last30)
      : sessions.filter(s => s.zoneType === zoneType && new Date(s.date) >= last30);

    const totalMade = filtered.reduce((a, b) => a + b.made, 0);
    const totalShots = filtered.reduce((a, b) => a + b.total, 0);
    const average = getPercentage(totalMade, totalShots);

    const sorted = (zoneType === 'global'
      ? sessions.filter(s => s.zoneType)
      : sessions.filter(s => s.zoneType === zoneType)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-15);

    const chartData = sorted.map(s => ({
      pct: getPercentage(s.made, s.total),
    }));

    return { average, chartData };
  }, [sessions, zoneType]);

  return (
    <motion.div
      className={`rounded-xl border p-3 transition-all duration-300 ${
        isHighlight
          ? 'glass-card-accent'
          : 'glass-card hover:border-primary/20'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={`font-mono text-lg font-bold ${isHighlight ? 'text-primary stat-glow' : 'text-foreground'}`}>
          {average > 0 ? `${average}%` : '--'}
        </span>
      </div>
      {chartData.length > 1 && (
        <div className="h-10 w-full mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${zoneType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="pct"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill={`url(#grad-${zoneType})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
