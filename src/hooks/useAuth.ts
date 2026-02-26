import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useSyncSessions } from './useSyncSessions';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { syncLocalDataToSupabase } = useSyncSessions();

  useEffect(() => {
    // 1. Obtener sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        syncLocalDataToSupabase(currentUser.id);
      }
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // Si el evento es un inicio de sesión exitoso, sincronizamos
      if (event === 'SIGNED_IN' && currentUser) {
        syncLocalDataToSupabase(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isGuest: !user };
};
