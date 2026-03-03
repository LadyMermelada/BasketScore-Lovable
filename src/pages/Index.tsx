import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../hooks/useAuth';
import { ZONES } from '../lib/zones';
import { calculateProStats, filterToday, filterLast30Days } from '../lib/stats';
import { supabase } from '../lib/supabase';

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
  // Extraemos las funciones necesarias del hook de sesiones
  const { sessions = [], addSession, updateSession, deleteSession, importAll, loading } = useSessions();
  const { isGuest, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'cancha' | 'club' | 'perfil'>('cancha');
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  
  // Estado para controlar si estamos editando una sesión existente
  const [editSession, setEditSession] = useState<any | null>(null);

  // Verificación de sesión: Si el usuario fue borrado de la DB pero el navegador aún tiene el token
  useEffect(() => {
    const checkSession = async () => {
      if (user && !user.email) {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.reload();
      }
    };
    checkSession();
  }, [user]);

  // Cálculos de estadísticas para los StatCards
  const stats = useMemo(() => ({
    today: calculateProStats(filterToday(sessions)),
    monthly: calculateProStats(filterLast30Days(sessions))
  }), [sessions]);

  // Manejo de navegación por pestañas con bloqueo de invitado
  const handleTabChange = useCallback((tab: any) => {
    if (tab !== 'cancha' && isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }, [isGuest]);

  // Abrir modal para tiro nuevo desde la cancha
  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);
    setEditSession(null); 
    setModalOpen(true);
  }, []);

  // Abrir modal para editar tiro existente desde el QuickLog
  const handleEdit = useCallback((session: any) => {
    setSelectedZone(session.zoneId);
    setEditSession(session);
    setModalOpen(true);
  }, []);

  // Guardar datos (Crear nuevo o Actualizar existente)
  const handleSave = useCallback((data: any) => {
    const zone = ZONES?.find(z => z.id === data.zoneId);
    const sessionData = {
      ...data,
      zoneType: (zone?.type || '2p') as any,
      zoneLabel: zone?.label || data.zoneId
    };

    if (editSession) {
      updateSession(editSession.id, sessionData);
    } else {
      addSession(sessionData);
    }
    setModalOpen(false);
    setEditSession(null);
  }, [editSession, addSession, updateSession]);

  // Pantalla de carga inicial
  if (loading && sessions.length === 0 && !isGuest) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-black text-[10px] tracking-widest uppercase animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="
