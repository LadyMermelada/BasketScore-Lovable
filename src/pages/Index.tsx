import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../hooks/useAuth';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';
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
      zoneType: zone?.type || '2p' as const,
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

  const handleDelete = useCallback((id: number) => {
    if (confirm('¿Eliminar registro?')) deleteSession(id);
  }, [deleteSession]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Toaster position="top-center" />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'cancha' && (
            <motion.div
              key="cancha"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                {isGuest && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center text-xs font-medium text-primary mb-4">
                    🏀 Usuario Invitado (Regístrate para acceder a todos los datos)
                  </div>
                )}
                <AppHeader sessions={sessions} onImport={importAll} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 max-w-5xl mx-auto">
                <BasketCourt sessions={sessions} onZoneClick={handleZoneClick} />
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <StatCard title="Global (30d)" sessions={sessions} zoneType="global" isHighlight delay={0.1} />
                  <StatCard title="Tiros Libres" sessions={sessions} zoneType="tl" delay={0.15} />
                  <StatCard title="2 Puntos" sessions={sessions} zoneType="2p" delay={0.2} />
                  <StatCard title="3 Puntos" sessions={sessions} zoneType="3p" delay={0.25} />
                </div>
              </div>
              <div className="max-w-5xl mx-auto mt-4">
                <QuickLog sessions={sessions} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            </motion.div>
          )}

          {activeTab === 'club' && !isGuest && (
            <motion.div key="club" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ClubView />
            </motion.div>
          )}

          {activeTab === 'perfil' && !isGuest && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
