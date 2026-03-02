import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Session } from '../lib/sessions';
import { useMemo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  sessions?: Session[];
  metric?: 'pps' | 'efg' | 'pct'; // Nueva prop para definir qué graficar
  zoneType?: string;
  isHighlight?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, sessions = [], metric = 'pct', zoneType, isHighlight, delay = 0 }: StatCardProps) => {
  // Generamos un ID único para el gradiente de esta tarjeta específica
  const gradientId = useMemo(() => `grad-${title.replace(/\s+/g, '-').toLowerCase()}`, [title]);

  // Preparamos los datos del gráfico calculando la métrica punto por punto
  const chartData = useMemo(() => {
    const filtered = sessions
      .filter(s => !zoneType || zoneType === 'global' || s.zoneType === zoneType)
      .slice(-15); // Mostramos los últimos 15 registros

    return filtered.map((s, i) => {
      let val = 0;
      if (metric === 'pps') {
        const points = (s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1));
        val = points / s.total;
      } else if (metric === 'efg') {
        // eFG simplificado por sesión
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-4 border transition-all hover:border-primary/50 h-[110px] ${
        isHighlight ? 'bg-primary/10 border-primary/20 shadow-lg' : 'bg-card border-border'
      }`}
    >
      <div className="relative z-10 pointer-events-none">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tighter">
            {value === "0.00" || value === "0.0" || value === 0 ? "—" : value}
          </span>
          {title.includes('%') && value !== "0.0" && value !== 0 && (
            <span className="text-xs font-bold opacity-50">%</span>
          )}
        </div>
        {subtitle && <p className="text-[9px] text-muted-foreground mt-1 italic font-medium">{subtitle}</p>}
      </div>

      {/* Visualizador de tendencia (Sparkline) */}
      <div className="absolute inset-0 z-0 opacity-40 translate-y-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="var(--primary)" 
              fill={`url(#${gradientId})`} 
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StatCard;
