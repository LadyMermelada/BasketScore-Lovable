import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useSyncSessions = () => {
  const syncLocalDataToSupabase = async (userId: string) => {
    // 1. Intentamos obtener los datos del LocalStorage
    // Nota: 'basket-sessions' es la clave que suele usar Lovable para useSessions
    const localData = localStorage.getItem('basket-sessions');

    if (!localData) return;

    try {
      const localSessions = JSON.parse(localData);

      if (localSessions.length === 0) return;

      toast.info(`Sincronizando ${localSessions.length} sesiones...`);

      // 2. Mapeamos al formato de la tabla 'shooting_sessions' de Supabase
      const sessionsToUpload = localSessions.map((s: any) => ({
        user_id: userId,
        zone_id: s.zoneId,
        zone_type: s.zoneType,
        made: s.made,
        total: s.total,
        note: s.note || '',
        created_at: s.date // Mantenemos la fecha original del entrenamiento
      }));

      // 3. Subida masiva a Supabase
      const { error } = await supabase
        .from('shooting_sessions')
        .insert(sessionsToUpload);

      if (error) {
        console.error('Error en sincronización:', error);
        toast.error('No se pudieron subir los datos locales.');
      } else {
        // 4. Si todo salió bien, limpiamos el LocalStorage para no duplicar
        localStorage.removeItem('basket-sessions');
        toast.success('¡Tus datos ahora están en la nube! ☁️');
        // Recargamos la página para que useSessions ahora lea de Supabase
        window.location.reload();
      }
    } catch (err) {
      console.error('Error al parsear datos locales:', err);
    }
  };

  return { syncLocalDataToSupabase };
};
