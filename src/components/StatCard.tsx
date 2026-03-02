import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Session } from '../lib/sessions';
import { useMemo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  sessions?: Session[];
  metric: 'pps' | 'efg' | 'pct';
  zoneType?: string;
  isHighlight?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, sessions = [], metric, zoneType, isHighlight, delay = 0 }: StatCardProps) => {
  // ID único para que los gradientes no se pisen entre tarjetas
  const gradId = useMemo(() => `neonGrad-${title.replace(/\s+/g, '-')}`, [title]);

  // Generamos la curva de tendencia calculando el PPS/eFG sesión por sesión
  const trendData = useMemo(() => {
    return sessions
      .filter(s => !zoneType || zoneType === 'global' || s.zoneType === zoneType)
      .slice(-10) 
      .map((s, i) => {
        let val = 0;
        if (metric === 'pps') {
          const pts = (s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1));
          val = Number((pts / s.total).toFixed(2));
        } else if (metric === 'efg') {
          const bonus = s.zoneType === '3p' ? 0.5 * s.made : 0;
          val = Number(((s.made + bonus) / s.total * 100).toFixed(1));
        } else {
          val = Number(((s.made / s.total) * 100).toFixed(0));
        }
        return { val, date: new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) };
      });
  }, [sessions, zoneType, metric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-[2rem] p-5 border transition-all duration-300 hover:scale-[1.02] h-[120px] ${
        isHighlight 
        ? 'bg-[#57ea9d]/10 border-[#57ea9d]/40 shadow-[0_0_20px_rgba(87,234,157,0.1)]' 
        : 'bg-card/40 border-border/50 backdrop-blur-md'
      }`}
    >
      <div className="relative z-10 pointer-events-none">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tighter ${isHighlight ? 'text-[#57ea9d]' : 'text-foreground'}`}>
              {value === "0.00" || value === "0.0" || value === 0 ? "—" : value}
            </span>
            {title.includes('%') && value !== "0.0" && value !== 0 && <span className="text-sm font-bold opacity-30">%</span>}
          </div>
          {subtitle && (
            <p className="text-[10px] font-bold text-[#57ea9d] mt-1 opacity-80">{subtitle}</p>
          )}
        </div>
      </div>

      {/* GRÁFICA NEÓN INTERACTIVA */}
      <div className="absolute inset-0 z-0 opacity-50 translate-y-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#57ea9d" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#57ea9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #57ea9d', fontSize: '10px' }}
              itemStyle={{ color: '#57ea9d', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#57ea9d', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="#57ea9d" 
              fill={`url(#${gradId})`} 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#57ea9d', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StatCard;
