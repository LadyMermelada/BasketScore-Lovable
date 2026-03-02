import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, AlertTriangle, User, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileViewProps {
  sessions: Session[];
}

const ProfileView = ({ sessions }: ProfileViewProps) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculamos stats globales para el perfil
  const stats = calculateProStats(sessions);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada correctamente");
      window.location.reload(); // Recargamos para limpiar el estado de la app
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      toast.success("Tu cuenta ha sido eliminada permanentemente");
      // Forzamos el cierre de sesión y limpieza
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("No se pudo eliminar la cuenta. Inténtalo más tarde.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* HEADER DEL PERFIL */}
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{user?.email?.split('@')[0]}</h2>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{stats.pps}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">PPS Global</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{stats.eFG}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">eFG% Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{sessions.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Sesiones</p>
          </div>
        </div>
      </div>

      {/* ACCIONES DE CUENTA */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ajustes de Cuenta</h3>
        </div>
        
        <div className="p-2 space-y-1">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Cerrar Sesión</p>
                <p className="text-xs text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/5 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-red-500">Eliminar Cuenta</p>
                <p className="text-xs text-muted-foreground">Borrar tus datos permanentemente</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border-2 border-red-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-black mb-2">¿Estás 100% seguro?</h3>
              <p className="text-muted-foreground text-sm mb-8">
                Esta acción es <span className="text-red-500 font-bold uppercase tracking-tighter">irreversible</span>. Perderás todo tu historial de tiro y progreso.
              </p>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="destructive" 
                  className="font-bold h-12 text-md"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'SÍ, ELIMINAR CUENTA'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="font-bold"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  No, quiero pensarlo mejor
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
