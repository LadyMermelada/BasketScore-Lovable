import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Session, getPercentage, getGlobalAverage } from '@/lib/sessions';
import { ZONE_TYPE_LABELS } from '@/lib/zones';

interface Props {
  sessions: Session[];
}

export default function ProfileView({ sessions }: Props) {
  const [metric, setMetric] = useState('global');
  const [range, setRange] = useState(30);

  const totalShots = sessions.reduce((a, b) => a + b.total, 0);
  const totalMade = sessions.reduce((a, b) => a + b.made, 0);
  const careerPct = getPercentage(totalMade, totalShots);

  const chartData = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - range);
    let filtered = sessions.filter(s => new Date(s.date) >= limit);
    if (metric !== 'global') {
      filtered = filtered.filter(s => s.zoneType === metric);
    }
    return filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: s.date.slice(5),
        pct: getPercentage(s.made, s.total),
      }));
  }, [sessions, metric, range]);

  const [filterZone, setFilterZone] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const filteredHistory = useMemo(() => {
    let f = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filterZone !== 'all') f = f.filter(s => s.zoneType === filterZone);
    if (filterDate) f = f.filter(s => s.date === filterDate);
    return f;
  }, [sessions, filterZone, filterDate]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-bold">👤 Mi Perfil</h2>

      {/* Career stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div className="glass-card p-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="block text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-1">Tiros Totales</span>
          <span className="font-mono text-2xl font-bold text-foreground">{totalShots}</span>
        </motion.div>
        <motion.div className="glass-card p-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="block text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-1">% Histórico</span>
          <span className="font-mono text-2xl font-bold text-primary stat-glow">{careerPct}%</span>
        </motion.div>
      </div>

      {/* Chart controls */}
      <div className="flex gap-2">
        <select
          value={metric}
          onChange={e => setMetric(e.target.value)}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
        >
          <option value="global">Global</option>
          <option value="3p">Solo 3 Puntos</option>
          <option value="2p">Solo 2 Puntos</option>
          <option value="tl">Solo Tiros Libres</option>
        </select>
        <select
          value={range}
          onChange={e => setRange(Number(e.target.value))}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
        >
          <option value={7}>7 días</option>
          <option value={30}>30 días</option>
          <option value={90}>3 meses</option>
          <option value={180}>6 meses</option>
          <option value={365}>1 año</option>
        </select>
      </div>

      {/* Chart */}
      <motion.div className="glass-card p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="h-36">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 105]} hide />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#profileGrad)" dot={{ r: 2, fill: 'hsl(var(--primary))' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Sin datos para este período
            </div>
          )}
        </div>
      </motion.div>

      {/* History */}
      <details className="glass-card">
        <summary className="p-3 cursor-pointer text-sm font-bold text-primary">
          Ver Historial Completo
        </summary>
        <div className="p-3 pt-0 space-y-3">
          <div className="flex gap-2">
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
            >
              <option value="all">Todas las zonas</option>
              <option value="3p">Solo 3 Puntos</option>
              <option value="2p">Solo 2 Puntos</option>
              <option value="tl">Solo Tiros Libres</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-[0.6rem] uppercase text-muted-foreground">Fecha</th>
                  <th className="text-left p-2 text-[0.6rem] uppercase text-muted-foreground">Zona</th>
                  <th className="text-left p-2 text-[0.6rem] uppercase text-muted-foreground">Ratio</th>
                  <th className="text-left p-2 text-[0.6rem] uppercase text-muted-foreground">%</th>
                  <th className="text-left p-2 text-[0.6rem] uppercase text-muted-foreground">Nota</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(s => {
                  const pct = getPercentage(s.made, s.total);
                  return (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="p-2 font-mono text-xs text-muted-foreground">{s.date}</td>
                      <td className="p-2 text-xs font-semibold">{s.zoneLabel}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{s.made}/{s.total}</td>
                      <td className={`p-2 font-mono text-xs font-bold ${pct >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>{pct}%</td>
                      <td className="p-2 text-[0.6rem] text-muted-foreground">{s.note || '-'}</td>
                    </tr>
                  );
                })}
                {filteredHistory.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}
