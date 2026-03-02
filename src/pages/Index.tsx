import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../hooks/useAuth'; 
import { ZONES } from '../lib/zones';
import { calculateProStats, filterToday, filterLast30Days } from '../lib/stats';

import AppHeader from '../components/AppHeader';
import BasketCourt from '../components/BasketCourt';
import StatCard from '../components/StatCard';
import QuickLog from '../components/QuickLog';
import ShotModal from '../components/ShotModal';
import BottomNav from '../components/BottomNav';
import ProfileView from '../components/ProfileView';
import AuthModal from '../components/AuthModal';

const Index = () => {
  const { sessions, addSession, updateSession, deleteSession, importAll } = useSessions();
  const { isGuest } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'cancha' | 'club' | 'perfil'>('cancha');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const stats = useMemo(() => ({
    today: calculateProStats(filterToday(sessions)),
    monthly: calculateProStats(filterLast30Days(sessions))
  }), [sessions]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 pb-24 selection:bg-[#57ea9d]/30">
      <Toaster theme="dark" position="top-center" />
      <div className="p-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'cancha' && (
            <motion.div key="cancha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AppHeader sessions={sessions} onImport={importAll} />
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mt-6">
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
                  <BasketCourt sessions={sessions} onZoneClick={handleZoneClick} />
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-black text-[#57ea9d] uppercase tracking-[0.3em] ml-2">Analytics Center</h3>
                  
                  <StatCard 
                    title="Puntos por Tiro (PPS)" 
                    value={stats.monthly.pps} 
                    subtitle={`Hoy: ${stats.today.pps} PPS`}
                    sessions={sessions} metric="pps" zoneType="global"
                    isHighlight delay={0.1} 
                  />

                  <StatCard 
                    title="eFG% (Eficiencia)" 
                    value={stats.monthly.eFG} 
                    subtitle={`Hoy: ${stats.today.eFG}%`}
                    sessions={sessions} metric="efg" zoneType="global"
                    delay={0.15} 
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                      title="% 3PT" 
                      value={stats.monthly.threePct} 
                      subtitle={`Hoy: ${stats.today.threePct}%`}
                      sessions={sessions} metric="pct" zoneType="3p"
                      delay={0.2} 
                    />
                    <StatCard 
                      title="% 2PT" 
                      value={stats.monthly.twoPct} 
                      subtitle={`Hoy: ${stats.today.twoPct}%`}
                      sessions={sessions} metric="pct" zoneType="2p"
                      delay={0.25} 
                    />
                  </div>

                  <StatCard 
                    title="Tiros Libres (FT%)" 
                    value={stats.monthly.ftPct} 
                    subtitle={`Hoy: ${stats.today.ftPct}%`}
                    sessions={sessions} metric="pct" zoneType="tl"
                    delay={0.3} 
                  />
                </div>
              </div>
              <div className="mt-10">
                <QuickLog sessions={sessions} onEdit={()=>{}} onDelete={deleteSession} />
              </div>
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ProfileView sessions={sessions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ShotModal open={modalOpen} onClose={() => setModalOpen(false)} zoneId={selectedZone} onSave={(d) => addSession({...d, zoneType: '2p', zoneLabel: d.zoneId})} />
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index; // <-- ESTA LÍNEA FALTABA
