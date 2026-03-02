import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '../lib/sessions';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();

  const loadSessions = useCallback(async () => {
    setLoading(true);
    if (isGuest) {
      const localData = localStorage.getItem('basket-sessions');
      setSessions(localData ? JSON.parse(localData) : []);
    } else if (user) {
      const { data, error } = await supabase
        .from('shooting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSessions(data.map(s => ({
          id: s.id,
          zoneId: s.zone_id,
          zoneType: s.zone_type,
          made: s.made,
          total: s.total,
          date: s.created_at,
          note: s.note,
          zoneLabel: s.zone_id
        })));
      }
    }
    setLoading(false);
  }, [user, isGuest]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const addSession = async (newData: Omit<Session, 'id'>) => {
    // Normalizamos la fecha a "YYYY-MM-DD" para comparar solo el día
    const todayStr = new Date(newData.date).toISOString().split('T')[0];

    if (isGuest) {
      const updatedSessions = [...sessions];
      const existingIdx = updatedSessions.findIndex(s => 
        s.zoneId === newData.zoneId && s.date.startsWith(todayStr)
      );

      if (existingIdx !== -1) {
        updatedSessions[existingIdx].made += newData.made;
        updatedSessions[existingIdx].total += newData.total;
        updatedSessions[existingIdx].note = newData.note || updatedSessions[existingIdx].note;
      } else {
        updatedSessions.unshift({ ...newData, id: Date.now() });
      }
      
      setSessions(updatedSessions);
      localStorage.setItem('basket-sessions', JSON.stringify(updatedSessions));
      toast.success('Sesión actualizada localmente');
    } else if (user) {
      // Lógica Supabase: Buscamos si existe la sesión hoy
      const { data: existing } = await supabase
        .from('shooting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('zone_id', newData.zoneId)
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('shooting_sessions')
          .update({
            made: existing.made + newData.made,
            total: existing.total + newData.total,
            note: newData.note || existing.note
          })
          .eq('id', existing.id);
        if (!error) loadSessions();
      } else {
        await supabase.from('shooting_sessions').insert([{
          user_id: user.id,
          zone_id: newData.zoneId,
          zone_type: newData.zoneType,
          made: newData.made,
          total: newData.total,
          note: newData.note,
          created_at: newData.date
        }]);
        loadSessions();
      }
      toast.success('¡Estadísticas actualizadas!');
    }
  };

  const deleteSession = async (id: string | number) => {
    if (isGuest) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem('basket-sessions', JSON.stringify(updated));
    } else {
      await supabase.from('shooting_sessions').delete().eq('id', id);
      loadSessions();
    }
  };

  return { sessions, loading, addSession, deleteSession, importAll: loadSessions };
};
