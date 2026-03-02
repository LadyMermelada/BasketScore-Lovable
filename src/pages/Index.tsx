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

type Tab = 'cancha' | 'club' | 'perfil';

const Index = () => {
  const { sessions, addSession, updateSession, deleteSession, importAll } = useSessions();
  const { isGuest } = useAuth(); 
  
  const [activeTab, setActiveTab] = useState<Tab>('cancha');
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [editSession, setEditSession] = useState<Session | null>(null);

  // --- CÁLCULO DE ESTADÍSTICAS PROFESIONALES ---
  const stats = useMemo(() => {
    const today = calculateProStats(filterToday(sessions));
    const monthly = calculateProStats(filterLast30Days(sessions));
    return { today, monthly };
  }, [sessions]);

  // --- HANDLERS ---
  const handleTabChange = useCallback((tab: Tab) => {
    if (tab !== 'cancha' && isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }, [isGuest]);

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);
    setEditSession(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((session: Session) => {
    setSelectedZone(session.zoneId);
    setEditSession(session);
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

    if (editSession) {
      updateSession(editSession.id, sessionData);
    } else {
      addSession(sessionData);
    }
    setModalOpen(false);
    setEditSession(null);
  }, [editSession, addSession, updateSession]);

  const handleDelete = useCallback((id: number | string) => {
    if (confirm('¿Eliminar este registro de entrenamiento?')) {
      deleteSession(id);
    }
  }, [deleteSession]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Toaster position="top-center" />
      
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
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-xs font-bold text-primary mb-4 shadow-sm">
                    🏀 MODO INVITADO: Tus datos se guardan solo en este dispositivo.
                  </div>
                )}
                <AppHeader sessions={sessions} onImport={importAll} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Visualización de la Cancha */}
                <div className="bg-card rounded-3xl border border-border p-4 shadow-sm">
                  <BasketCourt sessions={sessions} onZoneClick={handleZoneClick} />
                </div>

                {/* Panel de Métricas Profesionales */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1">
                    Análisis de Eficiencia
                  </h3>
                  
                  <StatCard 
                    title="Puntos por Tiro (PPS)" 
                    value={stats.today.pps} 
                    subtitle={`Media 30d: ${stats.monthly.pps}`}
                    isHighlight 
                    delay={0.1} 
                  />

                  <StatCard 
                    title="eFG% (Eficiencia Real)" 
                    value={stats.today.eFG} 
                    subtitle={`Tendencia 30d: ${stats.monthly.eFG}%`}
                    delay={0.15} 
                  />

                  <StatCard 
                    title="Tiros Libres (FT%)" 
                    value={stats.today.ftPct} 
                    subtitle={`Media 30d: ${stats.monthly.ftPct}%`}
                    delay={0.2} 
                  />

                  <StatCard 
                    title="Puntos Totales Hoy" 
                    value={stats.today.totalPoints} 
                    delay={0.25} 
                  />
                </div>
              </div>

              {/* Historial Reciente */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-lg">Sesiones Recientes</h3>
                </div>
                <QuickLog sessions={sessions} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            </motion.div>
          )}

          {activeTab === 'club' && !isGuest && (
            <motion.div key="club" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClubView />
            </motion.div>
          )}

          {activeTab === 'perfil' && !isGuest && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileView sessions={sessions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        zoneId={selectedZone}
        editSession={editSession}
        onSave={handleSave}
      />

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default Index;
