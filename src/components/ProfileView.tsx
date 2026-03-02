import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats, getPlayerRank } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { LogOut, Trash2, User, ShieldAlert, Award, BarChart2 } from 'lucide-react';

interface ProfileViewProps {
  sessions: Session[];
}

const ProfileView = ({ sessions }: ProfileViewProps) => {
  const { user } = useAuth();
  const [metricFilter, setMetricFilter] = useState<'pps' | 'efg' | 'raw'>('pps');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stats = calculateProStats(sessions);
  const rank = getPlayerRank(stats.pps);

  // AGRUPACIÓN DE DATOS POR DÍA para que la línea no se rompa
  const chartData = useMemo(() => {
    const dailyData: Record<string, { points: number, att: number, made: number, bonusMade: number, fgAtt: number }> = {};

    sessions.forEach(s => {
      const day = new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      if (!dailyData[day]) {
        dailyData[day] = { points: 0, att: 0, made: 0, bonusMade: 0, fgAtt: 0 };
      }
      
      const p = (s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1));
      dailyData[day].points += p;
      dailyData[day].att += s.total;
      dailyData[day].made += s.made;
      
      if (s.zoneType !== 'tl') {
        dailyData[day].fgAtt += s.total;
        dailyData[day].bonusMade += (s.made + (s.zoneType === '3p' ? 0.5 * s.made : 0));
      }
    });

    return Object.entries(dailyData).map(([fecha, d]) => ({
      fecha,
      pps: (d.points / d.att).toFixed(2),
      efg: d.fgAtt > 0 ? ((d.bonusMade / d.fgAtt) * 100).toFixed(1) : null,
      raw: ((d.made / d.att) * 100).toFixed(0)
    })).reverse(); // Orden cronológico
  }, [sessions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 px-2">
      
      {/* HEADER DE USUARIO */}
      <div className="bg-card rounded-3xl p-8 border border-border text-center shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-tighter ${rank.bg} ${rank.color} flex items-center gap-1`}>
          <Award className="w-3 h-3" /> {rank.label}
        </div>
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">{user?.email?.split('@')[0]}</h2>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{stats.pps}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">PPS</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{stats.eFG}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">eFG%</p>
          </div>
        </div>
      </div>

      {/* GRÁFICO HISTÓRICO */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wider">Progresión por Jornada</h3>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="fecha" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                tick={{fill: 'var(--muted-foreground)'}}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: 'var(--muted-foreground)'}}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}
                labelStyle={{ fontSize: '10px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey={metricFilter} 
                stroke="var(--primary)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorMetric)"
                dot={{ r: 4, fill: 'var(--card)', stroke: 'var(--primary)', strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {(['pps', 'efg', 'raw'] as const).map(m => (
            <button 
              key={m} 
              onClick={() => setMetricFilter(m)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${
                metricFilter === m 
                ? 'border-primary text-primary bg-primary/5 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]' 
                : 'border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              {m === 'raw' ? '% Simple' : m}
            </button>
          ))}
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold border-border hover:bg-muted" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
        <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0 text-red-500/40 hover:text-red-500 hover:bg-red-500/10" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 tracking-tight">¿Eliminar cuenta?</h3>
              <p className="text-muted-foreground text-xs mb-6 leading-relaxed">Esta acción borrará permanentemente todo tu historial de entrenamiento.</p>
              <div className="flex flex-col gap-2">
                <Button variant="destructive" className="font-bold py-6" onClick={async () => { await supabase.rpc('delete_user_account'); window.location.reload(); }}>SÍ, ELIMINAR CUENTA</Button>
                <Button variant="ghost" className="font-bold" onClick={() => setShowDeleteConfirm(false)}>CANCELAR</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
