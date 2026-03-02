import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../hooks/useAuth'; 
import { ZONES } from '../lib/zones';
import { calculateProStats, filterToday, filterLast30Days } from '../lib/stats';
import { supabase } from '../lib/supabase'; // Importante para el limbo

import AppHeader from '../components/AppHeader';
import BasketCourt from '../components/BasketCourt';
import StatCard from '../components/StatCard';
import QuickLog from '../components/QuickLog';
import ShotModal from '../components/ShotModal';
import BottomNav from '../components/BottomNav';
import ProfileView from '../components/ProfileView';
import ClubView from '../components/ClubView';
import AuthModal from '../components/AuthModal';

const Index = () => {
  const { sessions = [], addSession, deleteSession, importAll, loading } = useSessions();
  const { isGuest, user } = useAuth(); 
  
  const [activeTab, setActiveTab] = useState<'cancha' | 'club' | 'perfil'>('cancha');
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // EFECTO ANTI-LIMBO: Si el usuario no existe en la DB pero hay sesión, cerramos
  useEffect(() => {
    const checkSession = async () => {
      if (user) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
           localStorage.clear();
           window.location.reload();
        }
      }
    };
    checkSession();
  }, [user]);

  const stats = useMemo(() => {
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    return {
      today: calculateProStats(filterToday(safeSessions)),
      monthly: calculateProStats(filterLast30Days(safeSessions))
    };
  }, [sessions]);

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-primary font-black text-[10px] tracking-widest uppercase animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Toaster position="top-center" theme="dark" />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="p-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'cancha' && (
            <motion.div key="cancha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                {isGuest && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-[10px] font-black text-primary mb-4 tracking-widest uppercase shadow-sm">
                    🏀 MODO INVITADO
                  </div>
                )}
                <AppHeader sessions={sessions} onImport={importAll} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Contenedor con altura mínima forzada para la cancha */}
                <div className="bg-card rounded-[2rem] border border-border p-4 shadow-sm min-h-[350px] md:h-[450px] flex items-center justify-center relative">
                  <BasketCourt 
                    sessions={sessions} 
                    onZoneClick={(id) => { setSelectedZone(id); setModalOpen(true); }} 
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <StatCard title="PPS (30d)" sessions={sessions} zoneType="global" metric="pps" value={stats.monthly.pps} subtitle={`Hoy: ${stats.today.pps}`} isHighlight delay={0.1} />
                  <StatCard title="eFG% (30d)" sessions={sessions} zoneType="global" metric="efg" value={stats.monthly.eFG} subtitle={`Hoy: ${stats.today.eFG}%`} delay={0.15} />
                  <StatCard title="Tiros Libres" sessions={sessions} zoneType="tl" value={stats.monthly.ftPct} subtitle={`Hoy: ${stats.today.ftPct}%`} delay={0.2} />
                  <StatCard title="2 Puntos" sessions={sessions} zoneType="2p" value={stats.monthly.twoPct} delay={0.25} />
                  <StatCard title="3 Puntos" sessions={sessions} zoneType="3p" value={stats.monthly.threePct} delay={0.3} />
                </div>
              </div>

              <div className="mt-10">
                <QuickLog sessions={sessions} onEdit={() => {}} onDelete={deleteSession} />
              </div>
            </motion.div>
          )}

          {activeTab === 'club' && <motion.div key="club" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ClubView /></motion.div>}
          {activeTab === 'perfil' && <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ProfileView sessions={sessions} /></motion.div>}
        </AnimatePresence>
      </div>

      <ShotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        zoneId={selectedZone}
        onSave={(d) => {
          const zone = ZONES?.find(z => z.id === d.zoneId);
          addSession({...d, zoneType: (zone?.type || '2p') as any, zoneLabel: zone?.label || d.zoneId});
          setModalOpen(false);
        }}
      />
      <BottomNav active={activeTab} onChange={(t: any) => setActiveTab(t)} />
    </div>
  );
};

export default Index;
