import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats, getPlayerRank } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { LogOut, Trash2, User, ShieldAlert, Award, Calendar, BarChart2 } from 'lucide-react';

interface ProfileViewProps {
  sessions: Session[];
}

const ProfileView = ({ sessions }: ProfileViewProps) => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('mes');
  const [metricFilter, setMetricFilter] = useState('pps');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stats = calculateProStats(sessions);
  const rank = getPlayerRank(stats.pps);

  // Lógica del Gráfico Histórico
  const chartData = useMemo(() => {
    return sessions
      .slice()
      .reverse() // De más antiguo a más nuevo
      .map(s => ({
        fecha: new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        pps: ((s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1)) / s.total).toFixed(2),
        efg: s.zoneType !== 'tl' ? (((s.made + (s.zoneType === '3p' ? 0.5 * s.made : 0)) / s.total) * 100).toFixed(1) : null,
        raw: (s.made / s.total * 100).toFixed(0)
      }));
  }, [sessions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* HEADER CON RANGO */}
      <div className="bg-card rounded-3xl p-8 border border-border text-center shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-tighter ${rank.bg} ${rank.color} flex items-center gap-1`}>
          <Award className="w-3 h-3" /> {rank.label}
        </div>
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black">{user?.email?.split('@')[0]}</h2>
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{stats.pps}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">PPS</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{stats.eFG}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">eFG%</p>
          </div>
        </div>
      </div>

      {/* GRÁFICO HISTÓRICO RECUPERADO */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Progresión Histórica</h3>
          </div>
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {['dia', 'mes', 'año'].map(f => (
              <button 
                key={f} 
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${timeFilter === f ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="fecha" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey={metricFilter} 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--primary)' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {['pps', 'efg', 'raw'].map(m => (
            <button 
              key={m} 
              onClick={() => setMetricFilter(m)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${metricFilter === m ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground'}`}
            >
              {m === 'raw' ? '% Simple' : m}
            </button>
          ))}
        </div>
      </div>

      {/* AJUSTES COMPACTOS */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
        <Button variant="ghost" className="rounded-2xl h-12 text-red-500/50 hover:text-red-500" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* MODAL ELIMINAR (Mismo código anterior) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">¿Confirmas borrar todo?</h3>
              <p className="text-muted-foreground text-xs mb-6">Esta acción es irreversible y perderás tu historial.</p>
              <div className="flex flex-col gap-2">
                <Button variant="destructive" onClick={async () => { await supabase.rpc('delete_user_account'); window.location.reload(); }}>ELIMINAR MI CUENTA</Button>
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
