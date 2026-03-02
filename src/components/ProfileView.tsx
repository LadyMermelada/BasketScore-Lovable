import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, User, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileViewProps {
  sessions: Session[];
}

const ProfileView = ({ sessions }: ProfileViewProps) => {
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
    } catch (err) {
      toast.error("Error al eliminar cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10 px-1">
      {/* HEADER DEL PERFIL */}
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{user?.email?.split('@')[0]}</h2>
        <p className="text-muted-foreground text-sm mb-6">{user?.email}</p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{stats.pps}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">PPS Global</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{stats.eFG}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">eFG% Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{sessions.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Sesiones</p>
          </div>
        </div>
      </div>

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
        <select value={metric} onChange={e => setMetric(e.target.value)} className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground">
          <option value="global">Global</option>
          <option value="3p">Solo 3 Puntos</option>
          <option value="2p">Solo 2 Puntos</option>
          <option value="tl">Solo Tiros Libres</option>
        </select>
        <select value={range} onChange={e => setRange(Number(e.target.value))} className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground">
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
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#profileGrad)" dot={{ r: 2, fill: 'hsl(var(--primary))' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Sin datos</div>
          )}
        </div>
      </motion.div>

      {/* History */}
      <details className="glass-card rounded-xl overflow-hidden">
        <summary className="p-4 cursor-pointer text-sm font-bold text-primary list-none flex justify-between items-center">
          Ver Historial Completo <span>▼</span>
        </summary>
        <div className="p-4 pt-0 space-y-3">
          <div className="flex gap-2">
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)} className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs">
              <option value="all">Todas las zonas</option>
              <option value="3p">Solo 3 Puntos</option>
              <option value="2p">Solo 2 Puntos</option>
              <option value="tl">Solo Tiros Libres</option>
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border"><th className="text-left p-2 opacity-50">Fecha</th><th className="text-left p-2 opacity-50">Zona</th><th className="text-left p-2 opacity-50">Ratio</th><th className="text-left p-2 opacity-50">%</th></tr></thead>
              <tbody>
                {filteredHistory.map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="p-2 font-mono opacity-70">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-2 font-bold">{s.zoneId}</td>
                    <td className="p-2 opacity-70">{s.made}/{s.total}</td>
                    <td className="p-2 font-bold text-primary">{((s.made/s.total)*100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      <div className="bg-card rounded-3xl border border-border overflow-hidden p-2 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-colors text-left">
            <div className="flex items-center gap-3"><LogOut className="w-5 h-5 text-blue-500" /><div><p className="font-bold text-sm">Cerrar Sesión</p></div></div>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/5 transition-colors text-left group">
            <div className="flex items-center gap-3"><Trash2 className="w-5 h-5 text-red-500" /><div><p className="font-bold text-sm text-red-500">Eliminar Cuenta</p></div></div>
          </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border-2 border-red-500/50 rounded-3xl p-8 max-w-sm w-full text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-xl font-black mb-2">¿Seguro?</h3>
              <p className="text-muted-foreground text-sm mb-6">Acción irreversible.</p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>{isDeleting ? 'Borrando...' : 'SÍ, BORRAR CUENTA'}</Button>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>CANCELAR</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
