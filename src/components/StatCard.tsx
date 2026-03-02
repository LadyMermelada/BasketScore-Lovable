import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Session } from '../lib/sessions';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  sessions?: Session[];
  zoneType?: string;
  isHighlight?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, sessions = [], zoneType, isHighlight, delay = 0 }: StatCardProps) => {
  // Preparamos los datos para el gráfico pequeño
  const chartData = sessions
    .filter(s => zoneType === 'global' || s.zoneType === zoneType)
    .slice(-10) // Últimas 10 sesiones
    .map((s, i) => ({ val: (s.made / s.total) * 100, id: i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-4 border transition-all hover:border-primary/50 ${
        isHighlight ? 'bg-primary/10 border-primary/20 shadow-lg' : 'bg-card border-border'
      }`}
    >
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">{value === "0.00" || value === "0.0" ? "—" : value}</span>
          {title.includes('%') && value !== "0.0" && <span className="text-xs font-bold opacity-50">%</span>}
        </div>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-1 italic">{subtitle}</p>}
      </div>

      {/* Visualizador de tendencia (Sparkline) */}
      <div className="absolute inset-0 z-0 opacity-30 mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Tooltip 
              content={() => null} 
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} 
            />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke="var(--primary)" 
              fill="url(#gradient)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
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
