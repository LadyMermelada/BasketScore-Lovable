import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../hooks/useAuth'; 
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';
import { calculateProStats, filterToday, filterLast30Days } from '../lib/stats';

// Componentes
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
  const { sessions, addSession, updateSession, deleteSession, importAll } = useSessions();
  const { isGuest, user } = useAuth(); 
  
  const [activeTab, setActiveTab] = useState<'cancha' | 'club' | 'perfil'>('cancha');
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // --- MOTOR DE INTELIGENCIA: ESTADÍSTICAS ---
  // Se calculan en base a la fecha de la sesión, no a la fecha de hoy del sistema
  const stats = useMemo(() => {
    const today = calculateProStats(filterToday(sessions));
    const monthly = calculateProStats(filterLast30Days(sessions));
    return { today, monthly };
  }, [sessions]);

  // --- MANEJADORES ---
  const handleTabChange = useCallback((tab: 'cancha' | 'club' | 'perfil') => {
    if (tab !== 'cancha' && isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }, [isGuest]);

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback((data: { zoneId: string; date: string; total: number; made: number; note: string }) => {
    const zone = ZONES.find(z => z.id === data.zoneId);
    const sessionData = {
      zoneId: data.zoneId,
      date: data.date,
      total: data.total,
      made: data.made,
      zoneType: (zone?.type || '2p') as "tl" | "2p" | "3p",
      zoneLabel: zone?.label || data.zoneId,
      note: data.note,
    };

    addSession(sessionData);
    setModalOpen(false);
  }, [addSession]);

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      <Toaster position="top-center" theme="dark" />
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="p-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'cancha' && (
            <motion.div
              key="cancha"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                {isGuest && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-[10px] font-black text-primary mb-4 tracking-widest uppercase shadow-sm">
                    🏀 MODO INVITADO: Regístrate para sincronizar con la nube.
                  </div>
                )}
                <AppHeader sessions={sessions} onImport={importAll} />
              </div>

              {/* GRID PRINCIPAL: CANCHA + STATS */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                
                {/* Visualización de la Cancha (Heatmap dinámico con números grandes) */}
                <div className="bg-card rounded-3xl border border-border p-4 shadow-sm flex items-center justify-center">
                  <BasketCourt sessions={sessions} onZoneClick={handleZoneClick} />
                </div>

                {/* Panel lateral de Estadísticas Pro */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 mb-1">
                    Análisis de Eficiencia
                  </h3>
                  
                  <StatCard 
                    title="PPS (30d)" 
                    sessions={sessions}
                    zoneType="global"
                    metric="pps"
                    value={stats.monthly.pps} 
                    subtitle={`Sesión de hoy: ${stats.today.pps} PPS`}
                    isHighlight 
                    delay={0.1} 
                  />

                  <StatCard 
                    title="eFG% (30d)" 
                    sessions={sessions}
                    zoneType="global"
                    metric="efg"
                    value={stats.monthly.eFG} 
                    subtitle={`Hoy: ${stats.today.eFG}%`}
                    delay={0.15} 
                  />

                  <StatCard 
                    title="Tiros Libres" 
                    sessions={sessions}
                    zoneType="tl"
                    value={stats.monthly.ftPct} 
                    subtitle={`Hoy: ${stats.today.ftPct}%`}
                    delay={0.2} 
                  />

                  <StatCard 
                    title="2 Puntos (2PT%)" 
                    sessions={sessions}
                    zoneType="2p"
                    value={stats.monthly.twoPct} 
                    subtitle={`Hoy: ${stats.today.twoPct}%`}
                    delay={0.25} 
                  />

                  <StatCard 
                    title="3 Puntos (3PT%)" 
                    sessions={sessions}
                    zoneType="3p"
                    value={stats.monthly.threePct} 
                    subtitle={`Hoy: ${stats.today.threePct}%`}
                    delay={0.3} 
                  />
                </div>
              </div>

              {/* Historial Reciente con Scroll (Máximo 5 sesiones visibles) */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-lg tracking-tight">Sesiones Recientes</h3>
                </div>
                <QuickLog 
                  sessions={sessions} 
                  onEdit={() => {}} 
                  onDelete={deleteSession} 
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'club' && (
            <motion.div 
              key="club" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <ClubView />
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div 
              key="perfil" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <ProfileView sessions={sessions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        zoneId={selectedZone}
        onSave={handleSave}
      />

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default Index;
