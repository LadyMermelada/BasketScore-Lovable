import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../lib/sessions';
import { calculateProStats } from '../lib/stats';
import { Button } from '@/components/ui/button';
import { 
  LogOut, Trash2, User, ShieldAlert, 
  Target, Zap, Percent, Hash 
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileViewProps {
  sessions: Session[];
}

const ProfileView = ({ sessions }: ProfileViewProps) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculamos las estadísticas usando el motor profesional
  const stats = calculateProStats(sessions);

  // Cálculos adicionales de volumen histórico
  const totals = sessions.reduce((acc, s) => {
    acc.made += s.made;
    acc.total += s.total;
    if (s.zoneType === '2p') { acc.made2p += s.made; acc.att2p += s.total; }
    if (s.zoneType === '3p') { acc.made3p += s.made; acc.att3p += s.total; }
    if (s.zoneType === 'tl') { acc.madeFT += s.made; acc.attFT += s.total; }
    return acc;
  }, { made: 0, total: 0, made2p: 0, att2p: 0, made3p: 0, att3p: 0, madeFT: 0, attFT: 0 });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Error al cerrar sesión");
    else window.location.reload();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      toast.success("Cuenta eliminada");
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      toast.error("Error al eliminar cuenta");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10 px-1">
      
      {/* 1. HEADER: INFO DE USUARIO */}
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 border border-primary/20">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{user?.email?.split('@')[0]}</h2>
        <p className="text-muted-foreground text-xs">{user?.email}</p>
      </div>

      {/* 2. MÉTRICAS DE EFICIENCIA (LAS ESTRELLAS) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
          <div className="flex justify-center mb-1 text-primary"><Zap className="w-4 h-4" /></div>
          <p className="text-2xl font-black text-primary">{stats.pps}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">PPS Global</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
          <div className="flex justify-center mb-1 text-primary"><Target className="w-4 h-4" /></div>
          <p className="text-2xl font-black text-primary">{stats.eFG}%</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">eFG% Total</p>
        </div>
      </div>

      {/* 3. DESGLOSE HISTÓRICO PROFUNDO */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Historial por Zonas</h3>
        </div>
        
        <div className="divide-y divide-border">
          {/* Fila 3 Puntos */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Tiros de 3</p>
              <p className="text-[10px] text-muted-foreground font-mono">{totals.made3p} anotados / {totals.att3p} lanzados</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground">{stats.threePct}%</p>
            </div>
          </div>

          {/* Fila 2 Puntos */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Tiros de 2</p>
              <p className="text-[10px] text-muted-foreground font-mono">{totals.made2p} anotados / {totals.att2p} lanzados</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground">{stats.twoPct}%</p>
            </div>
          </div>

          {/* Fila Tiros Libres */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Tiros Libres</p>
              <p className="text-[10px] text-muted-foreground font-mono">{totals.madeFT} anotados / {totals.attFT} lanzados</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground">{stats.ftPct}%</p>
            </div>
          </div>
        </div>

        {/* Totales de volumen */}
        <div className="p-4 bg-muted/30 grid grid-cols-2 gap-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-medium">Total Intentos: <span className="font-bold">{totals.total}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-medium">Puntos Totales: <span className="font-bold">{stats.totalPoints}</span></p>
          </div>
        </div>
      </div>

      {/* 4. AJUSTES DE CUENTA (COMPACTOS) */}
      <div className="pt-4 flex flex-col gap-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm font-medium w-full"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
          Cerrar Sesión
        </button>

        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium text-red-500/70 w-full"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar cuenta permanentemente
        </button>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">¿Confirmas la eliminación?</h3>
              <p className="text-muted-foreground text-xs mb-6 px-4">
                Esta acción borrará todos tus registros históricos y no se puede deshacer.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="destructive" className="font-bold" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'SÍ, ELIMINAR TODO'}
                </Button>
                <Button variant="ghost" className="text-xs" onClick={() => setShowDeleteConfirm(false)}>
                  CANCELAR
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
