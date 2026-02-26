import { createClient } from '@supabase/supabase-js';

// Estas variables se cargan desde tu archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad para el desarrollador
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Error: Faltan las credenciales de Supabase. ' +
    'Asegúrate de tener un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
