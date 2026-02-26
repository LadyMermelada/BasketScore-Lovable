import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '../lib/sessions';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();

  // --- 1. CARGA DE DATOS ---
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // MODO INVITADO: Leer de LocalStorage
        const localData = localStorage.getItem('basket-sessions');
        setSessions(localData ? JSON.parse(localData) : []);
      } else if (user) {
        // MODO PRO: Leer de Supabase
        const { data, error } = await supabase
          .from('shooting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Mapeamos los campos de la BD al formato que usa tu App
        const mappedSessions: Session[] = data.map(s => ({
          id: s.id,
          zoneId: s.zone_id,
          zoneType: s.zone_type,
          made: s.made,
          total: s.total,
          date: s.created_at,
          note: s.note,
          zoneLabel: s.zone_id // O el mapeo que prefieras
        }));
        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error('Error cargando sesiones:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // --- 2. AGREGAR SESIÓN ---
  const addSession = async (newSession: Omit<Session, 'id'>) => {
    if (isGuest) {
      const sessionWithId = { ...newSession, id: Date.now() };
      const updated = [sessionWithId, ...sessions];
      setSessions(updated);
      localStorage.setItem('basket-sessions', JSON.stringify(updated));
      toast.success('Sesión guardada localmente');
    } else if (user) {
      const { data, error } = await supabase
        .from('shooting_sessions')
        .insert([{
          user_id: user.id,
          zone_id: newSession.zoneId,
          zone_type: newSession.zoneType,
          made: newSession.made,
          total: newSession.total,
          note: newSession.note,
          created_at: newSession.date
        }])
        .select();

      if (error) {
        toast.error('Error al guardar en la nube');
      } else {
        loadSessions(); // Recargamos para ver el cambio
        toast.success('Sesión guardada en Supabase');
      }
    }
  };

  // --- 3. ACTUALIZAR SESIÓN ---
  const updateSession = async (id: string | number, updates: Partial<Session>) => {
    if (isGuest) {
      const updated = sessions.map(s => s.id === id ? { ...s, ...updates } : s);
      setSessions(updated);
      localStorage.setItem('basket-sessions', JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('shooting_sessions')
        .update({
          made: updates.made,
          total: updates.total,
          note: updates.note
        })
        .eq('id', id);

      if (error) toast.error('Error al actualizar');
      else loadSessions();
    }
  };

  // --- 4. ELIMINAR SESIÓN ---
  const deleteSession = async (id: string | number) => {
    if (isGuest) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem('basket-sessions', JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('shooting_sessions')
        .delete()
        .eq('id', id);

      if (error) toast.error('Error al eliminar');
      else loadSessions();
    }
  };

  return {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession,
    importAll: loadSessions // Mantenemos compatibilidad con AppHeader
  };
};
