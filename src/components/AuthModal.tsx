import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Trophy, Users, History, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Mantiene el basename para GitHub Pages
        redirectTo: window.location.origin + '/BasketScore-Lovable/'
      }
    });
    if (error) toast.error(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(mode === 'login' ? '¡Bienvenido de nuevo!' : '¡Cuenta creada con éxito!');
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />

          <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {mode === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta gratis'}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {mode === 'login'
                ? 'Ingresa para sincronizar tus estadísticas.'
                : 'Guarda tu progreso y únete a clubes de basket.'}
            </p>

            <div className="grid gap-3 mb-6">
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                Continuar con Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
                <span className="bg-card px-2">O con tu email</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button className="w-full font-bold" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
              </Button>
            </form>

            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="mt-6 text-sm text-primary hover:underline"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
