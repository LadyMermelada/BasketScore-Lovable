import { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Session } from '../lib/sessions';
import { calculateProStats, getPlayerRank } from '../lib/stats';
import { Award, TrendingUp, Target, User } from 'lucide-react';

const ProfileView = ({ sessions }: { sessions: Session[] }) => {
  const [metric, setMetric] = useState<'pps' | 'efg' | 'raw'>('pps');
  const stats = calculateProStats(sessions);
  const rank = getPlayerRank(stats.pps);

  const chartData = useMemo(() => {
    const daily: any = {};
    sessions.forEach(s => {
      const day = new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      if (!daily[day]) daily[day] = { p: 0, a: 0, m: 0, b: 0, fa: 0 };
      daily[day].p += (s.made * (s.zoneType === '3p' ? 3 : s.zoneType === '2p' ? 2 : 1));
      daily[day].a += s.total;
      daily[day].m += s.made;
      if (s.zoneType !== 'tl') {
        daily[day].fa += s.total;
        daily[day].b += (s.made + (s.zoneType === '3p' ? 0.5 * s.made : 0));
      }
    });
    return Object.entries(daily).map(([fecha, d]: any) => ({
      fecha,
      pps: Number((d.p / d.a).toFixed(2)),
      efg: d.fa > 0 ? Number((d.b / d.fa * 100).toFixed(1)) : 0,
      raw: Number((d.m / d.a * 100).toFixed(0))
    })).reverse();
  }, [sessions]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-10 text-center relative overflow-hidden">
        <div className={`absolute top-6 right-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${rank.bg} ${rank.color} border border-current/20`}>
          {rank.label}
        </div>
        <div className="mx-auto w-24 h-24 bg-[#57ea9d]/10 rounded-full flex items-center justify-center mb-6 border-2 border-[#57ea9d]/20">
          <User className="w-12 h-12 text-[#57ea9d]" />
        </div>
        <h2 className="text-3xl font-black mb-8 tracking-tighter">Estadísticas de Élite</h2>
        <div className="flex justify-center gap-12">
          <div className="text-center">
            <p className="text-4xl font-black text-[#57ea9d]">{stats.pps}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PPS Global</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-[#57ea9d]">{stats.eFG}%</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">eFG% Total</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-[#57ea9d] w-6 h-6" />
            <h3 className="font-black text-lg uppercase tracking-tight">Progresión Temporal</h3>
          </div>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-2 border border-slate-800">
            {(['pps', 'efg', 'raw'] as const).map(m => (
              <button key={m} onClick={() => setMetric(m)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${metric === m ? 'bg-[#57ea9d] text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#57ea9d" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#57ea9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="fecha" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #57ea9d', color: '#fff' }}
                cursor={{ stroke: '#57ea9d', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey={metric} stroke="#57ea9d" strokeWidth={4} fill="url(#mainGrad)" dot={{ r: 5, fill: '#0f172a', stroke: '#57ea9d', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
