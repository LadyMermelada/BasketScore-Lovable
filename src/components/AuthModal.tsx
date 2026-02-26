import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Trophy, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // REGISTRO
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Esto asegura que tras confirmar email vuelva a la app
            emailRedirectTo: window.location.origin + '/BasketScore-Lovable/',
          },
        });
        if (error) throw error;
        toast.success('¡Revisa tu email para confirmar tu cuenta!');
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('¡Bienvenido de nuevo!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/BasketScore-Lovable/',
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="h-1.5 bg-gradient-to-r from-primary to-blue-600" />
          
          <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {isSignUp ? 'Crea tu cuenta' : '¡Hola de nuevo!'}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {isSignUp ? 'Empieza a guardar tus estadísticas en la nube.' : 'Ingresa para ver tu progreso histórico.'}
            </p>

            <Button variant="outline" className="w-full mb-6" onClick={handleGoogleLogin}>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
                <span className="bg-card px-2">O con tu email</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 text-left">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="tu@email.com" 
                    className="pl-10"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Tu contraseña" 
                    className="pl-10"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <Button className="w-full font-bold h-11" type="submit" disabled={loading}>
                {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Entrar'}
              </Button>
            </form>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-6 text-sm text-primary hover:underline"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
