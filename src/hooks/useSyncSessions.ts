import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useSyncSessions = () => {
  const syncLocalDataToSupabase = async (userId: string) => {
    const localData = localStorage.getItem('basket-sessions');
    if (!localData) return;

    try {
      const localSessions = JSON.parse(localData);
      if (localSessions.length === 0) return;

      // 1. LIMPIEZA INMEDIATA: Evitamos que otro proceso lea esto mientras subimos
      localStorage.removeItem('basket-sessions');
      
      toast.info(`Sincronizando ${localSessions.length} sesiones...`);

      const sessionsToUpload = localSessions.map((s: any) => ({
        user_id: userId,
        zone_id: s.zoneId,
        zone_type: s.zoneType,
        made: s.made,
        total: s.total,
        note: s.note || '',
        created_at: s.date 
      }));

      const { error } = await supabase
        .from('shooting_sessions')
        .insert(sessionsToUpload);

      if (error) {
        // Si falla, devolvemos los datos para no perderlos
        localStorage.setItem('basket-sessions', localData);
        console.error('Error en sincronización:', error);
        toast.error('Error al sincronizar datos.');
      } else {
        toast.success('¡Datos sincronizados en la nube! ☁️');
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Error al parsear datos:', err);
    }
  };

  return { syncLocalDataToSupabase };
};
