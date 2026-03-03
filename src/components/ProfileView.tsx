import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, User, ShieldAlert, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { ThemePreset } from '../hooks/useThemeColor';

interface ProfileViewProps {
  sessions: Session[];
  themeColor: {
    themeId: string;
    setThemeId: (id: string) => void;
    currentTheme: ThemePreset;
    presets: ThemePreset[];
  };
}

const ProfileView = ({ sessions, themeColor }: ProfileViewProps) => {
  const { user } = useAuth();
  const [metric, setMetric] = useState('global');
  const [range, setRange] = useState(30);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterZone, setFilterZone] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const stats = calculateProStats(sessions);
  const totalShots = sessions.reduce((a, b) => a + b.total, 0);
  const totalMade = sessions.reduce((a, b) => a + b.made, 0);
  const careerPct = totalShots > 0 ? ((totalMade / totalShots) * 100).toFixed(1) : "0";

  const chartData = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - range);
    let filtered = sessions.filter(s => new Date(s.date) >= limit);
    if (metric !== 'global') filtered = filtered.filter(s => s.zoneType === metric);

    return filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        pct: (s.made / s.total) * 100,
      }));
  }, [sessions, metric, range]);

  const filteredHistory = useMemo(() => {
    let f = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filterZone !== 'all') f = f.filter(s => s.zoneType === filterZone);
    if (filterDate) f = f.filter(s => s.date.startsWith(filterDate));
    return f;
  }, [sessions, filterZone, filterDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await supabase.rpc('delete_user_account');
      await supabase.auth.signOut();
      window.location.reload();
    } catch {
      toast.error("Error al eliminar cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10 px-1">
      {/* HEADER DEL PERFIL */}
      <div className="glass-card p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 border-2 border-primary/20">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{user?.email?.split('@')[0]}</h2>
        <p className="text-muted-foreground text-xs mb-4">{user?.email}</p>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-mono font-bold text-primary">{stats.pps}</p>
            <p className="text-[0.6rem] uppercase font-bold text-muted-foreground tracking-wider">PPS Global</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-mono font-bold text-primary">{stats.eFG}%</p>
            <p className="text-[0.6rem] uppercase font-bold text-muted-foreground tracking-wider">eFG% Total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-mono font-bold text-primary">{sessions.length}</p>
            <p className="text-[0.6rem] uppercase font-bold text-muted-foreground tracking-wider">Sesiones</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div className="glass-card p-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground font-bold mb-1">Tiros Totales</span>
          <span className="font-mono text-xl font-bold text-foreground">{totalShots}</span>
        </motion.div>
        <motion.div className="glass-card p-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="block text-[0.6rem] uppercase tracking-wider text-muted-foreground font-bold mb-1">% Histórico</span>
          <span className="font-mono text-xl font-bold text-primary stat-glow">{careerPct}%</span>
        </motion.div>
      </div>

      {/* Theme Color Picker */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Color Base</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {themeColor.presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => themeColor.setThemeId(preset.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold ${
                themeColor.themeId === preset.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: `hsl(${preset.primary})` }}
              />
              <span className="hidden sm:inline">{preset.label}</span>
              <span className="sm:hidden">{preset.emoji}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chart controls */}
      <div className="flex gap-2">
        <select value={metric} onChange={e => setMetric(e.target.value)} className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground">
          <option value="global">Global</option>
          <option value="3p">Solo 3 Puntos</option>
          <option value="2p">Solo 2 Puntos</option>
          <option value="tl">Solo Tiros Libres</option>
        </select>
        <select value={range} onChange={e => setRange(Number(e.target.value))} className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground">
          <option value={7}>7 días</option>
          <option value={30}>30 días</option>
          <option value={90}>3 meses</option>
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
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#profileGrad)" dot={{ r: 2, fill: 'hsl(var(--primary))' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sin datos</div>
          )}
        </div>
      </motion.div>

      {/* History */}
      <details className="glass-card rounded-xl overflow-hidden">
        <summary className="p-4 cursor-pointer text-xs font-bold text-primary list-none flex justify-between items-center uppercase tracking-wider">
          Ver Historial Completo <span>▼</span>
        </summary>
        <div className="p-4 pt-0 space-y-3">
          <div className="flex gap-2">
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)} className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs">
              <option value="all">Todas las zonas</option>
              <option value="3p">Solo 3 Puntos</option>
              <option value="2p">Solo 2 Puntos</option>
              <option value="tl">Solo Tiros Libres</option>
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border"><th className="text-left p-2 text-muted-foreground text-[0.6rem] uppercase tracking-wider font-bold">Fecha</th><th className="text-left p-2 text-muted-foreground text-[0.6rem] uppercase tracking-wider font-bold">Zona</th><th className="text-left p-2 text-muted-foreground text-[0.6rem] uppercase tracking-wider font-bold">Ratio</th><th className="text-left p-2 text-muted-foreground text-[0.6rem] uppercase tracking-wider font-bold">%</th></tr></thead>
              <tbody>
                {filteredHistory.map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="p-2 font-mono text-muted-foreground">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-2 font-bold">{s.zoneId}</td>
                    <td className="p-2 font-mono text-muted-foreground">{s.made}/{s.total}</td>
                    <td className="p-2 font-mono font-bold text-primary">{((s.made/s.total)*100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* Account actions */}
      <div className="glass-card overflow-hidden p-2 space-y-1">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors text-left">
          <LogOut className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs">Cerrar Sesión</span>
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-destructive/5 transition-colors text-left group">
          <Trash2 className="w-4 h-4 text-destructive" />
          <span className="font-bold text-xs text-destructive">Eliminar Cuenta</span>
        </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-2 border-destructive/50 p-8 max-w-sm w-full text-center">
              <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">¿Seguro?</h3>
              <p className="text-muted-foreground text-xs mb-6">Acción irreversible.</p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="font-bold text-xs uppercase tracking-wider">
                  {isDeleting ? 'Borrando...' : 'SÍ, BORRAR CUENTA'}
                </Button>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="font-bold text-xs uppercase tracking-wider">
                  CANCELAR
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
